import AnnouncementService from '../services/announcement.service';
import RealtimeNotificationService from '../services/realtime-notification.service';

jest.mock('../services/realtime-notification.service', () => ({
  __esModule: true,
  default: { broadcast: jest.fn() },
}));

describe('AnnouncementService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('publica um comunicado de manutenção para as conexões ativas', () => {
    const announcement = AnnouncementService.publish('maintenance');

    expect(announcement.templateKey).toBe('maintenance');
    expect(announcement.title).toBe('Manutenção programada');
    expect(RealtimeNotificationService.broadcast).toHaveBeenCalledWith(
      announcement.title,
      announcement.message,
    );
  });

  test('rejeita um comunicado inexistente', () => {
    expect(() => AnnouncementService.publish('nao-existe')).toThrow(
      'Comunicado inválido.',
    );
  });
});
