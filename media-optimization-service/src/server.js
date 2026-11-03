import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import sharp from 'sharp';

const fastify = Fastify({ logger: true });

// Registrar suporte a upload de arquivos (limite de 10MB)
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Endpoint de Health Check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', uptime: process.uptime() };
});

// Endpoint de Otimização de Imagem
fastify.post('/optimize', async (request, reply) => {
  const data = await request.file();

  if (!data) {
    return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
  }

  // Converte o Stream do arquivo em Buffer na memória RAM
  const buffer = await data.toBuffer();

  // Processa e otimiza a imagem com Sharp para o formato WebP
  const optimizedBuffer = await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer();

  // Retorna a imagem otimizada
  reply
    .type('image/webp')
    .header('Content-Disposition', 'inline; filename="optimized.webp"')
    .send(optimizedBuffer);
});

// Inicialização do Servidor
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