import { redisSubscriber } from '../config/redis';
import { AULA_CRIADA_CHANNEL } from './aula-criada.event';
import Aula from '../models/Aula';
import RealtimeNotificationService from '../services/realtime-notification.service';

async function handleMessage(message: string): Promise<void> {
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

    const aula = await Aula.findByPk(event.data.aulaId);
    const materia = aula?.materia ?? 'Nova aula';
    RealtimeNotificationService.broadcast(
      'Nova aula disponível',
      `A aula de ${materia} acabou de ser publicada na EduLivre.`,
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
