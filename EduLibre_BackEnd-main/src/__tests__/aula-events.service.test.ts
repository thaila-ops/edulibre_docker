import AulaEventsService from '../services/aula-events.service';
import { AULA_CRIADA_CHANNEL } from '../events/aula-criada.event';

jest.mock('../config/redis', () => ({
  redisClient: {
    isReady: true,
    withCommandOptions: jest.fn().mockReturnThis(),
    publish: jest.fn(),
  },
}));

import { redisClient } from '../config/redis';

const publishMock = jest.mocked(redisClient.publish);

describe('Publicação do evento aula.criada', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    publishMock.mockResolvedValue(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('publica no canal correto com os dados da aula', async () => {
    const result = await AulaEventsService.publishCreated(17, 20);

    expect(result).toBe(true);
    expect(publishMock).toHaveBeenCalledTimes(1);

    const [channel, message] = publishMock.mock.calls[0];

    expect(channel).toBe(AULA_CRIADA_CHANNEL);
    expect(JSON.parse(message as string)).toEqual({
      eventId: expect.any(String),
      eventType: 'aula.criada',
      occurredAt: expect.any(String),
      data: {
        aulaId: 17,
        professorId: 20,
      },
    });
  });
  it('retorna false e registra quando a publicação falha', async () => {
  const error = new Error('Falha simulada no Redis');
  const warnSpy = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => {});

  publishMock.mockRejectedValueOnce(error);

  await expect(
    AulaEventsService.publishCreated(17, 20),
  ).resolves.toBe(false);

  expect(publishMock).toHaveBeenCalledTimes(1);
  expect(warnSpy).toHaveBeenCalledWith(
    '[Eventos] Falha ao publicar aula.criada:',
    error.message,
  );
});
it('não tenta publicar quando o Redis está indisponível', async () => {
  jest.replaceProperty(redisClient, 'isReady', false);
  jest.spyOn(console, 'warn').mockImplementation(() => {});

  const result = await AulaEventsService.publishCreated(17, 20);

  expect(result).toBe(false);
  expect(redisClient.withCommandOptions).not.toHaveBeenCalled();
  expect(publishMock).not.toHaveBeenCalled();
});
});