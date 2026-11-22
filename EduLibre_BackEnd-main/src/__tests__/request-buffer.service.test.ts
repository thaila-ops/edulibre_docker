import RequestBufferService from '../services/request-buffer.service';

const mockPush = jest.fn();
const mockLength = jest.fn();
const mockRange = jest.fn();
const mockRemove = jest.fn();

jest.mock('../config/redis', () => ({
  redisClient: {
    isReady: true,
    withCommandOptions: jest.fn(() => ({
      rPush: mockPush,
      lLen: mockLength,
      lRange: mockRange,
      lRem: mockRemove,
    })),
  },
}));

describe('RequestBufferService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('enfileira uma requisição com identificador e metadados', async () => {
    mockPush.mockResolvedValue(1);

    const request = await RequestBufferService.enqueue(
      'pagamento',
      'POST',
      '/pagamentos',
      { bookingId: 12 },
    );

    expect(request).toMatchObject({
      target: 'pagamento',
      method: 'POST',
      path: '/pagamentos',
      body: { bookingId: 12 },
      attempts: 0,
    });
    expect(mockPush).toHaveBeenCalledWith(
      RequestBufferService.getKey(),
      expect.any(String),
    );
  });

  test('consulta o tamanho do buffer', async () => {
    mockLength.mockResolvedValue(3);

    await expect(RequestBufferService.size()).resolves.toBe(3);
  });

  test('lista apenas entradas JSON válidas', async () => {
    mockRange.mockResolvedValue([
      JSON.stringify({
        id: 'valid-request',
        target: 'pagamento',
        method: 'POST',
        path: '/pagamentos',
        body: null,
        createdAt: '2026-11-22T00:00:00.000Z',
        attempts: 0,
      }),
      'entrada-invalida',
    ]);

    await expect(RequestBufferService.peek()).resolves.toHaveLength(1);
  });

  test('retorna false quando o Redis falha', async () => {
    mockLength.mockRejectedValue(new Error('Redis indisponível'));

    await expect(RequestBufferService.size()).resolves.toBe(0);
  });

  test('remove uma requisição pelo identificador', async () => {
    const raw = JSON.stringify({
      id: 'request-1',
      target: 'pagamento',
      method: 'POST',
      path: '/pagamentos',
      body: null,
      createdAt: '2026-11-22T00:00:00.000Z',
      attempts: 0,
    });
    mockRange.mockResolvedValue([raw]);
    mockRemove.mockResolvedValue(1);

    await expect(RequestBufferService.remove('request-1')).resolves.toBe(true);
    expect(mockRemove).toHaveBeenCalledWith(
      RequestBufferService.getKey(),
      1,
      raw,
    );
  });
});
