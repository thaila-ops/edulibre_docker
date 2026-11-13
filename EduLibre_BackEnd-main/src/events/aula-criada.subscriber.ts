import { redisSubscriber } from '../config/redis';
import { AULA_CRIADA_CHANNEL } from './aula-criada.event';

function handleMessage(message: string): void {
  try {
    const event: unknown = JSON.parse(message);

    if (
      typeof event !== 'object' ||
      event === null ||
      !('eventType' in event) ||
      event.eventType !== 'aula.criada' ||
      !('eventId' in event) ||
      typeof event.eventId !== 'string' ||
      !('data' in event) ||
      typeof event.data !== 'object' ||
      event.data === null ||
      !('aulaId' in event.data) ||
      typeof event.data.aulaId !== 'number'
    ) {
      console.warn('[Eventos] Mensagem aula.criada inválida; ignorada.');
      return;
    }

    console.info(
      `[Eventos] RECEBIDO: ${event.eventType}; ` +
        `eventId=${event.eventId}; aulaId=${event.data.aulaId}`,
    );
  } catch (error) {
    console.warn(
      '[Eventos] Falha ao interpretar aula.criada:',
      error instanceof Error ? error.message : 'Erro desconhecido',
    );
  }
}

export async function startAulaCriadaSubscriber(): Promise<void> {
  await redisSubscriber.connect();
  await redisSubscriber.subscribe(AULA_CRIADA_CHANNEL, handleMessage);

  console.info(`[Eventos] Canal assinado: ${AULA_CRIADA_CHANNEL}`);
}