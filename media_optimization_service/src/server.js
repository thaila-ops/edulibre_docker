import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import sharp from 'sharp';

const fastify = Fastify({ logger: true });


fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});


fastify.get('/health', async (request, reply) => {
  return { status: 'ok', uptime: process.uptime() };
});


fastify.post('/optimize', async (request, reply) => {
  const data = await request.file();

  if (!data) {
    return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
  }


  const buffer = await data.toBuffer();

P
  const optimizedBuffer = await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer();


  reply
    .type('image/webp')
    .header('Content-Disposition', 'inline; filename="optimized.webp"')
    .send(optimizedBuffer);
});

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