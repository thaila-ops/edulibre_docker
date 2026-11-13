import { redisSubscriber } from '../config/redis';
import { AULA_CRIADA_CHANNEL } from '../events/aula-criada.event';
import { startAulaCriadaSubscriber } from '../events/aula-criada.subscriber';

jest.mock('../config/redis', () => ({
  redisSubscriber: {
    connect: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockResolvedValue(undefined),
  },
}));

const subscribeMock = jest.mocked(redisSubscriber.subscribe);

describe('Consumidor de aula.criada', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('assina o canal e registra o evento recebido', async () => {
    await startAulaCriadaSubscriber();

    expect(redisSubscriber.connect).toHaveBeenCalledTimes(1);
    expect(subscribeMock).toHaveBeenCalledTimes(1);
    expect(subscribeMock).toHaveBeenCalledWith(
      AULA_CRIADA_CHANNEL,
      expect.any(Function),
    );

    const handleMessage = subscribeMock.mock.calls[0][1];

    handleMessage(
      JSON.stringify({
        eventId: 'evento-teste-1',
        eventType: 'aula.criada',
        occurredAt: '2026-11-13T12:00:00.000Z',
        data: {
          aulaId: 17,
          professorId: 20,
        },
      }),
      AULA_CRIADA_CHANNEL,
    );

    expect(console.info).toHaveBeenCalledWith(
      '[Eventos] RECEBIDO: aula.criada; ' +
        'eventId=evento-teste-1; aulaId=17',
    );
  });

  it('ignora uma mensagem com estrutura inválida', async () => {
    await startAulaCriadaSubscriber();
    const handleMessage = subscribeMock.mock.calls[0][1];
    jest.mocked(console.info).mockClear();

    handleMessage(
      JSON.stringify({ eventType: 'aula.criada' }),
      AULA_CRIADA_CHANNEL,
    );

    expect(console.warn).toHaveBeenCalledWith(
      '[Eventos] Mensagem aula.criada inválida; ignorada.',
    );
    expect(console.info).not.toHaveBeenCalled();
  });

  it('trata uma mensagem que não é JSON válido', async () => {
    await startAulaCriadaSubscriber();
    const handleMessage = subscribeMock.mock.calls[0][1];
    jest.mocked(console.info).mockClear();

    expect(() => {
      handleMessage('isto não é JSON', AULA_CRIADA_CHANNEL);
    }).not.toThrow();

    expect(console.warn).toHaveBeenCalledWith(
      '[Eventos] Falha ao interpretar aula.criada:',
      expect.any(String),
    );
    expect(console.info).not.toHaveBeenCalled();
  });
});