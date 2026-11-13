import { randomUUID } from 'node:crypto';
import { redisClient } from '../config/redis';
import {
  AULA_CRIADA_CHANNEL,
  type AulaCriadaEvent,
} from '../events/aula-criada.event';

export default class AulaEventsService {
  public static async publishCreated(
    aulaId: number,
    professorId: number,
  ): Promise<boolean> {
    if (!redisClient.isReady) {
      console.warn('[Eventos] Redis indisponível; aula.criada não publicado.');
      return false;
    }

    const event: AulaCriadaEvent = {
      eventId: randomUUID(),
      eventType: 'aula.criada',
      occurredAt: new Date().toISOString(),
      data: { aulaId, professorId },
    };

    try {
      const subscribers = await redisClient
        .withCommandOptions({ timeout: 500 })
        .publish(AULA_CRIADA_CHANNEL, JSON.stringify(event));

      console.info(
        `[Eventos] PUBLICADO: ${event.eventType}; ` +
          `eventId=${event.eventId}; aulaId=${aulaId}; ` +
          `assinantes=${subscribers}`,
      );

      return true;
    } catch (error) {
      console.warn(
        '[Eventos] Falha ao publicar aula.criada:',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );

      return false;
    }
  }
}
