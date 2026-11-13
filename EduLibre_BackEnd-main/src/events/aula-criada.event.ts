export const AULA_CRIADA_CHANNEL = 'edulibre:aulas:criada';

export interface AulaCriadaEvent {
  eventId: string;
  eventType: 'aula.criada';
  occurredAt: string;
  data: {
    aulaId: number;
    professorId: number;
  };
}