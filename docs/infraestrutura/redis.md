# Redis no EduLibre

O Redis armazena o cache das listagens e dos destaques de aulas do EduLibre. O MySQL continua sendo a fonte dos dados. Esta entrega corresponde à tarefa [EDLIBRE-7](https://edulibre2.atlassian.net/browse/EDLIBRE-7), integrada pelo [PR #3](https://github.com/thaila-ops/edulibre_docker/pull/3), com o commit de implementação `617a66c`.

Esta documentação registra a implementação e as verificações realizadas em novembro de 2026. Redis Pub/Sub ainda não foi implementado e pertence a uma entrega posterior.

## Funcionamento do cache

A estratégia usada é **cache-aside**:

1. A aplicação consulta a versão do grupo `aulas` no Redis.
2. Monta uma chave com os filtros, a paginação e a versão atual.
3. Se encontrar os dados, retorna o JSON armazenado (`HIT`).
4. Se não encontrar (`MISS`), consulta o MySQL, monta a resposta e grava no Redis com expiração (`SET`).
5. Se não conseguir consultar a versão, busca diretamente no banco sem ler ou gravar o cache nessa requisição.

Rotas atendidas: `GET /aulas`, `GET /aulas/destaque` e a listagem administrativa que utiliza `AulaService.list`. A consulta individual de uma aula não utiliza este cache.

Exemplos de chaves:

```text
edulibre:cache-version:aulas
edulibre:aulas:list:{"materia":"","professorId":"","status":"ativa","page":1,"pageSize":10}:<versao>
edulibre:aulas:featured:<versao>
```

Quando a chave de versão ainda não existe, utiliza-se `initial`. A listagem diferencia matéria, professor, status, página e tamanho de página para não reutilizar respostas de consultas diferentes.

## Expiração e invalidação

O TTL padrão é **60 segundos**, configurável por `CACHE_TTL_SECONDS`. A gravação utiliza a opção `EX` do Redis. Valores que não sejam inteiros positivos impedem a gravação e geram um aviso, sem interromper a operação principal.

Após uma alteração bem-sucedida no banco, `CacheService.invalidate('aulas')` substitui a versão por um novo UUID. A próxima consulta utiliza outra chave e busca os dados atualizados. As entradas da versão anterior não são apagadas imediatamente: expiram pelo TTL. A chave de versão não tem TTL.

| Serviço | Operações que invalidam | Dados afetados |
| --- | --- | --- |
| Aulas | Criar, editar, excluir, bloquear e desbloquear | Conteúdo e presença das aulas nas listas |
| Avaliações | Criar avaliação | Média, quantidade e lista de avaliações |
| Agendamentos | Criar, editar, pagar e excluir | Quantidade de reservas e reservas pagas |

Aceitar ou recusar um agendamento não invalida o cache: a resposta atual de aulas não expõe o status individual do agendamento, e essas decisões não alteram os totais armazenados.

## Arquivos principais

- `EduLibre_BackEnd-main/src/config/redis.ts`: conexão e eventos do cliente Redis.
- `EduLibre_BackEnd-main/src/services/cache.service.ts`: leitura, gravação, TTL e versão.
- `EduLibre_BackEnd-main/src/services/aula.service.ts`: consultas cache-aside e invalidação de aulas.
- `EduLibre_BackEnd-main/src/services/avaliacao.service.ts`: invalidação após avaliação.
- `EduLibre_BackEnd-main/src/services/agendamento.service.ts`: invalidação após alterações de reservas e pagamentos.
- `EduLibre_BackEnd-main/src/serializers/aula.serializer.ts`: formato da resposta armazenada.
- `docker-compose.yml`: Redis e variáveis de conexão do backend.

## Configuração

- Imagem: `redis:7.4-alpine`.
- Rede: `internal_network`.
- Endereço para os containers dessa rede: `redis:6379`.
- Sem publicação de porta no computador.
- Healthcheck com `redis-cli ping`.
- Cliente Node.js: pacote `redis`, versão instalada nesta entrega `6.3.0`.
- `REDIS_URL`: `redis://redis:6379` na rede Docker.
- `CACHE_TTL_SECONDS`: `60` por padrão.
- Limite de conexão: 2.000 ms; limite por comando de cache: 500 ms.
- `disableOfflineQueue: true`: comandos não ficam aguardando em uma fila enquanto o cliente está desconectado.

O nome `redis` é resolvido dentro da rede Docker. O serviço não publica uma porta no host; executar o backend diretamente no computador exige configurar um endereço Redis acessível nesse ambiente.

## Iniciar e verificar

Execute os comandos na raiz do projeto, com o Docker Desktop iniciado.

Validar a configuração:

```powershell
docker compose config --quiet
```

Iniciar o Redis em segundo plano:

```powershell
docker compose up -d redis
```

Consultar o estado:

```powershell
docker compose ps redis
```

O campo STATUS deve apresentar `(healthy)`. O campo PORTS pode mostrar `6379/tcp`, sem mapeamento para uma porta do computador.

Verificar a resposta:

```powershell
docker compose exec redis redis-cli ping
```

Resposta esperada: `PONG`.

Após modificar o código do backend, reconstruir sua imagem:

```powershell
docker compose up -d --build --no-deps backend
```

Esse comando não inicia dependências. MySQL e Redis devem estar em execução. A mensagem `[Redis] Conexão pronta para uso.` confirma a conexão do backend.

## Verificações realizadas

### Leitura e gravação

Executar duas consultas consecutivas:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/aulas?page=1&pageSize=10" | Out-Null
Invoke-RestMethod -Uri "http://localhost:3001/aulas?page=1&pageSize=10" | Out-Null
docker compose logs --since 30s --tail 20 backend
```

Foi observada a sequência `MISS → SET → HIT`. A expiração também foi verificada anteriormente: após o TTL, uma nova consulta registrou `MISS → SET`. Um TTL escrito no log, isoladamente, não comprova que a expiração ocorreu.

### Invalidação após edição

1. Preparar uma alteração em uma aula de teste do professor autenticado, sem salvar ainda.
2. Consultar a listagem para preencher o cache.
3. Salvar a edição e consultar novamente antes dos 60 segundos de TTL.
4. Conferir o conteúdo atualizado e os logs:

```powershell
(Invoke-RestMethod -Uri "http://localhost:3001/aulas?page=1&pageSize=10").data |
  Select-Object id, materia, descricao
docker compose logs --since 15m backend |
  Select-String -Pattern "INVALIDATE|aulas:list"
```

Nos resultados enviados durante a implementação, a aula de teste `16` retornou a descrição atualizada. Os logs mostraram `INVALIDATE: aulas`, mudança de versão e `MISS → SET → HIT` nas novas chaves. Os destaques também registraram leitura e gravação com chave versionada. Os IDs e UUIDs são evidências daquele ambiente, não valores fixos para outros ambientes.

### Indisponibilidade e reconexão

Em ambiente local de teste:

```powershell
docker compose stop redis
(Invoke-RestMethod -Uri "http://localhost:3001/aulas?page=1&pageSize=10").data |
  Select-Object id, materia
docker compose start redis
docker compose logs --since 2m --tail 25 backend
```

Religar o Redis mesmo se a consulta falhar. No teste realizado, a listagem respondeu durante a interrupção e o backend registrou a reconexão sem precisar reiniciar. Duas consultas posteriores produziram novamente `MISS → SET → HIT`. Os avisos de timeout durante a interrupção são esperados.

## Testes automatizados

No diretório `EduLibre_BackEnd-main`:

```powershell
npm run build
npm test
```

Resultado registrado antes do commit: **47 testes aprovados em 8 suítes**, além de compilação TypeScript concluída. Essa contagem corresponde à suíte completa do backend; nem todos os testes são de cache. Os testes novos utilizam simulações e não exigem Docker.

| Arquivo de teste | Cobertura adicionada |
| --- | --- |
| `cache.service.test.ts` | 6 testes: TTL padrão/configurado, Redis indisponível, falha de leitura, troca de versão e falha de invalidação |
| `avaliacao.service.test.ts` | 2 testes: invalidação após gravação e ausência de invalidação em falha |
| `agendamento.service.test.ts` | 9 testes: criação, alteração, pagamento e exclusão em sucesso/falha, além de pagamento por outro aluno |

Os testes de TTL verificam as opções enviadas ao Redis, não a passagem real do tempo. Não foi criada uma suíte específica para todas as mutações de `AulaService`; a edição foi verificada manualmente. O teste executado antes do push confirmou acesso à página inicial, não o fluxo completo de cache. O PR #3 foi mesclado e não apresentava checks de CI no GitHub.

## Limitações conhecidas

- A invalidação é posterior à gravação no MySQL e não é atômica com ela. Se o Redis estiver indisponível, a gravação pode ter sucesso e a invalidação retornar `false`. Os serviços atualmente não repetem essa invalidação nem mantêm uma fila durável. Após a reconexão, uma entrada antiga que ainda exista pode ser usada até expirar.
- O TTL de 60 segundos conta a partir da gravação da entrada no Redis; não representa uma garantia de consistência imediata em todas as condições de concorrência ou falha.
- O namespace é global: uma alteração invalida logicamente todas as listagens e os destaques de aulas, mesmo quando afeta apenas uma aula.
- A resposta inclui dados relacionados de professores e alunos das avaliações. Alterações de perfil no serviço de usuários ainda não invalidam esse cache; essas informações podem ficar antigas até o TTL.
- Os logs atuais permitem acompanhar o fluxo, mas não constituem métricas de disponibilidade ou latência, dashboards ou alertas.
- Não há implementação de Pub/Sub nesta entrega.

## Consultar logs

Se houver falha na inicialização ou na verificação de saúde:

```powershell
docker compose logs --tail 50 redis
```
