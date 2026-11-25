import RealtimeNotificationService from './realtime-notification.service';
import HttpError from '../utils/http-error';

const ANNOUNCEMENT_TEMPLATES = {
  maintenance: {
    title: 'Manutenção programada',
    message:
      'A EduLivre passará por manutenção programada. Alguns recursos podem ficar temporariamente indisponíveis.',
  },
  instability: {
    title: 'Instabilidade identificada',
    message:
      'Identificamos uma instabilidade e nossa equipe já está trabalhando para normalizar o serviço.',
  },
  restored: {
    title: 'Serviço normalizado',
    message:
      'Os serviços da EduLivre foram normalizados. Agradecemos sua compreensão.',
  },
  news: {
    title: 'Novidades na EduLivre',
    message:
      'Há novidades disponíveis na plataforma. Explore as novas experiências de aprendizagem.',
  },
} as const;

export type AnnouncementKey = keyof typeof ANNOUNCEMENT_TEMPLATES;

export default class AnnouncementService {
  public static publish(templateKey: string) {
    const announcement = ANNOUNCEMENT_TEMPLATES[
      templateKey as AnnouncementKey
    ];

    if (!announcement) {
      throw new HttpError(400, 'Comunicado inválido.');
    }

    RealtimeNotificationService.broadcast(announcement.title, announcement.message);

    return {
      templateKey,
      ...announcement,
      deliveredAt: new Date().toISOString(),
    };
  }
}
