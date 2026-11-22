# Documentação Técnica — Microsserviço de Otimização de Mídia (Edulibre)

## 1. Visão Geral e Arquitetura

O **media-optimization-service** é um microsserviço stateless de alta performance desenvolvido para o ecossistema **Edulibre**. Sua responsabilidade única é receber uploads de imagens via HTTP, validar integridade e formato, converter o arquivo para o padrão moderno **WebP**, corrigir metadados de orientação e retornar o binário otimizado com um identificador único global (UUID).

### Pilares Arquiteturais
- **Processamento 100% em Memória (Stateless):** Nenhum arquivo é gravado no sistema de arquivos do container. Todo o fluxo ocorre via streams e buffers em RAM, eliminando gargalos de I/O, necessidade de volumes Docker e problemas de permissão de diretório.
- **Padronização WebP:** Conversão nativa utilizando a engine *libvips* (via `sharp`) com qualidade configurada em `80`, equilibrando redução drástica de payload (KB) com fidelidade visual.
- **Correção Automática de Orientação (EXIF):** Aplicação de `.rotate()` antes da compressão para garantir que fotos tiradas em dispositivos móveis mantenham a orientação correta após a remoção de metadados.
- **Identificação Única Não Colidível:** Cada resposta bem-sucedida injeta um UUID v4 gerado via `node:crypto` (`randomUUID()`) no cabeçalho `Content-Disposition`, permitindo que serviços consumidores (backend principal ou storage S3/MinIO) salvem o arquivo diretamente sem risco de sobrescrita.
- **Containerização Enxuta (Alpine Linux):** Baseado na imagem oficial `node:20-alpine`, mantendo o footprint da imagem reduzido e inicialização rápida.

### Fluxo de Processamento

```text
[Cliente / API Gateway]
         │
         ▼  POST /optimize (multipart/form-data)
[Fastify + @fastify/multipart]
         │
         ├──► Valida presença do arquivo ──► (400 Bad Request)
         ├──► Valida limite de 10MB      ──► (413 Payload Too Large)
         ├──► Valida MIME (image/*)      ──► (400 Bad Request)
         │
         ▼  Stream -> Buffer em RAM
[Sharp (libvips)]
         │
         ├──► Falha de decodificação     ──► (400 Bad Request)
         ├──► .rotate() (Ajuste EXIF)
         └──► .webp({ quality: 80 })
         │
         ▼  Gera UUID v4 (randomUUID)
[Resposta HTTP 200 OK]
  ├─ Content-Type: image/webp
  ├─ Content-Disposition: inline; filename="<uuid>.webp"
  └─ Body: Buffer binário WebP


  2. Stack Tecnológica e Estrutura do Projeto
Dependências Principais
Runtime: Node.js v20+ (ES Modules habilitado)

Framework HTTP: fastify (baixo overhead e logger integrado via Pino)

Parser Multipart: @fastify/multipart (leitura de streams com controle rígido de limites)

Processamento de Imagem: sharp (bindings nativos C++ para libvips)

Criptografia / IDs: node:crypto (módulo nativo para geração de UUID v4)


media-optimization-service/
├── docs/
│   └── README.md           # Documentação técnica do microsserviço
├── src/
│   └── server.js           # Ponto de entrada, configuração Fastify, rotas e tratamento de erros
├── Dockerfile              # Definição da imagem Docker (node:20-alpine)
├── package.json            # Dependências e scripts de execução
└── package-lock.json       # Trava de versões exatas das dependências

3. Variáveis de Ambiente e Parâmetros Internos
Parâmetro / Variável	Tipo	Valor Padrão	Descrição
PORT	Variável de Ambiente	3000	Porta TCP em que o servidor Fastify escuta requisições (0.0.0.0).
fileSize (Multipart)	Configuração Interna	10485760 (10 MB)	Tamanho máximo permitido por arquivo enviado na requisição.
quality (Sharp WebP)	Configuração Interna	80	Nível de compressão WebP (escala de 1 a 100).
4. Contrato da API (Endpoints)
4.1. Health Check
Verifica se o serviço está ativo e respondendo. Ideal para healthchecks do Docker Compose, Kubernetes ou Load Balancers.

Endpoint: GET /health

Autenticação: Nenhuma (rede interna)

Resposta de Sucesso (200 OK):

JSON
{
  "status": "ok",
  "uptime": 142.87412
}
4.2. Otimização de Imagem
Recebe uma imagem em formatos tradicionais (JPEG, PNG, GIF, TIFF, AVIF, WebP), valida e retorna o arquivo convertido para WebP.

Endpoint: POST /optimize

Content-Type da Requisição: multipart/form-data

Campo do Formulário: file (binário da imagem)

Resposta de Sucesso (200 OK)
Headers:

content-type: image/webp

content-disposition: inline; filename="58232b99-11b2-42c1-9b12-6c0bb89995ef.webp"

content-length: <tamanho_em_bytes>

Body: Fluxo binário (Buffer) da imagem otimizada em WebP.

Matriz de Erros Tratados
Status HTTP	Código / Cenário	Exemplo de Payload JSON Retornado
400 Bad Request	Nenhum arquivo anexado no formulário	{"success": false, "error": "Nenhum arquivo foi enviado na requisição."}
400 Bad Request	MIME Type não inicia com image/ (ex: PDF, TXT, EXE)	{"success": false, "error": "Formato inválido (application/pdf). Apenas arquivos de imagem são permitidos."}
400 Bad Request	Arquivo corrompido ou codec não suportado pelo Sharp	{"success": false, "error": "Não foi possível processar a imagem. O arquivo pode estar corrompido ou em um formato inválido."}
413 Payload Too Large	Arquivo ultrapassa o limite de 10 MB (FST_REQ_FILE_TOO_LARGE)	{"success": false, "error": "O arquivo enviado é muito grande. O limite máximo permitido é 10MB."}
500 Internal Server Error	Falha inesperada no servidor	{"success": false, "error": "Erro interno ao processar a mídia."}
5. Exemplos de Integração
5.1. Via cURL (Terminal)
Bash
curl -i -X POST http://localhost:3000/optimize \
  -F "file=@./foto-original.jpg;type=image/jpeg" \
  --output imagem-otimizada.webp
5.2. Via Node.js / Backend Edulibre (Fetch API Nativa)
Exemplo de como outro microsserviço do Edulibre pode consumir a API, extrair o nome UUID gerado e obter o buffer final:

JavaScript
import fs from 'node:fs';

async function otimizarImagem(caminhoArquivo, mimeType) {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(caminhoArquivo);
  const blob = new Blob([fileBuffer], { type: mimeType });

  formData.append('file', blob, 'upload.jpg');

  const response = await fetch('http://media_optimization:3000/optimize', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(`Falha na otimização (${response.status}): ${erro.error}`);
  }

  // Extrai o nome único gerado pelo cabeçalho Content-Disposition
  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename="([^"]+)"/);
  const uniqueFileName = match ? match[1] : `${crypto.randomUUID()}.webp`;

  const optimizedArrayBuffer = await response.arrayBuffer();
  const optimizedBuffer = Buffer.from(optimizedArrayBuffer);

  return {
    fileName: uniqueFileName,
    mimeType: 'image/webp',
    buffer: optimizedBuffer,
  };
}
6. Infraestrutura, Execução e Troubleshooting
6.1. Comandos Docker Compose
Bash
# Construir a imagem sem cache
docker compose build --no-cache media_optimization

# Subir o serviço em segundo plano
docker compose up -d media_optimization

# Acompanhar logs em tempo real
docker compose logs -f media_optimization
6.2. Notas Técnicas sobre Alpine Linux e Inicialização
Binários Pré-compilados do Sharp: O sharp v0.33+ distribui binários pré-compilados para linuxmusl-x64 e linuxmusl-arm64. Portanto, o Dockerfile não deve instalar pacotes manuais como vips-dev nem executar npm rebuild sharp, pois isso força uma recompilação desnecessária que pode quebrar o carregamento nativo no Alpine.

Persistência do Processo: O src/server.js deve obrigatoriamente invocar start() com await fastify.listen({ port: Number(port), host: '0.0.0.0' }). Caso contrário, o Node.js encerrará o processo imediatamente com exit code 0 e o Docker entrará em loop de reinicialização.