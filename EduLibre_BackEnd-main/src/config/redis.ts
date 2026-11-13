import 'dotenv/config';
import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL ?? 'redis://redis:6379',
  socket: {
    connectTimeout: 2000,
  },
  disableOfflineQueue: true,
});

redisClient.on('ready', () => {
  console.info('[Redis] Conexão pronta para uso.');
});

redisClient.on('error', (error: Error) => {
  console.warn('[Redis] Falha de conexão:', error.message);
});
export const redisSubscriber = redisClient.duplicate();

redisSubscriber.on('ready', () => {
  console.info('[Redis Subscriber] Conexão pronta para uso.');
});

redisSubscriber.on('error', (error: Error) => {
  console.warn('[Redis Subscriber] Falha de conexão:', error.message);
});
