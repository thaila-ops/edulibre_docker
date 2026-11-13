import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';

const fastify = Fastify({ logger: true });

// Configuração do limite de tamanho (ex: máximo 10MB por arquivo)
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

fastify.get('/health', async (request, reply) => {
  return { status: 'ok', uptime: process.uptime() };
});

fastify.post('/optimize', async (request, reply) => {
  try {
    const data = await request.file();

    // 1. Erro: Nenhum arquivo enviado
    if (!data) {
      return reply.status(400).send({ 
        success: false,
        error: 'Nenhum arquivo foi enviado na requisição.' 
      });
    }

    // 2. Erro: Formato MIME inválido (não é imagem)
    if (!data.mimetype || !data.mimetype.startsWith('image/')) {
      return reply.status(400).send({ 
        success: false,
        error: `Formato inválido (${data.mimetype || 'desconhecido'}). Apenas arquivos de imagem são permitidos.` 
      });
    }

    // Converte o stream do arquivo para Buffer
    const buffer = await data.toBuffer();

    // 3. Processamento com Sharp
    const optimizedBuffer = await sharp(buffer)
      .rotate() // Corrige orientação EXIF automaticamente
      .webp({ quality: 80 })
      .toBuffer();

    const uniqueFileName = `${randomUUID()}.webp`;

    return reply
      .type('image/webp')
      .header('Content-Disposition', `inline; filename="${uniqueFileName}"`)
      .send(optimizedBuffer);

  } catch (error) {
    request.log.error(error);

    // 4. Erro gerado pelo Fastify Multipart quando passa do limite de tamanho (10MB)
    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.status(413).send({ 
        success: false,
        error: 'O arquivo enviado é muito grande. O limite máximo permitido é 10MB.' 
      });
    }

    // 5. Erro gerado pelo Sharp (arquivo corrompido ou malformado)
    if (error.message && (error.message.includes('Vips') || error.message.includes('unsupported') || error.message.includes('corrupt'))) {
      return reply.status(400).send({ 
        success: false,
        error: 'Não foi possível processar a imagem. O arquivo pode estar corrompido ou em um formato inválido.' 
      });
    }

    // Erro genérico de Servidor (Fallback)
    return reply.status(500).send({ 
      success: false,
      error: 'Erro interno ao processar a mídia.' 
    });
  }
});

// Função para iniciar o servidor (ESSENCIAL para o container não fechar)
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port: Number(port), host: '0.0.0.0' });
    console.log(`🚀 Microsserviço de Mídia rodando em http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();