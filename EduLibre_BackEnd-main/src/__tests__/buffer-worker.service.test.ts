import BufferWorkerService from '../services/buffer-worker.service';
import RequestBufferService, {
  type BufferedRequest,
} from '../services/request-buffer.service';

jest.mock('../services/request-buffer.service', () => ({
  __esModule: true,
  default: {
    peek: jest.fn(),
    remove: jest.fn(),
    markAttempt: jest.fn(),
  },
}));

const successfulRequest: BufferedRequest = {
  id: 'request-success',
  target: 'pagamento',
  method: 'POST',
  path: '/health',
  body: null,
  createdAt: '2026-11-22T00:00:00.000Z',
  attempts: 0,
};

describe('BufferWorkerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('remove da fila uma requisição reenviada com sucesso', async () => {
    jest.mocked(RequestBufferService.peek).mockResolvedValue([
      successfulRequest,
    ]);
    jest.mocked(RequestBufferService.remove).mockResolvedValue(true);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    const processed = await BufferWorkerService.flushOnce({
      batchSize: 10,
      targetUrls: {
        pagamento: 'http://pagamento:3002',
      },
      requestTimeoutMs: 100,
    });

    expect(processed).toBe(1);
    expect(RequestBufferService.remove).toHaveBeenCalledWith(
      'request-success',
    );
  });

  test('mantém a requisição e registra tentativa em caso de falha', async () => {
    jest.mocked(RequestBufferService.peek).mockResolvedValue([
      successfulRequest,
    ]);
    jest.mocked(RequestBufferService.markAttempt).mockResolvedValue(true);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    const processed = await BufferWorkerService.flushOnce({
      batchSize: 10,
      targetUrls: {
        pagamento: 'http://pagamento:3002',
      },
      requestTimeoutMs: 100,
    });

    expect(processed).toBe(0);
    expect(RequestBufferService.remove).not.toHaveBeenCalled();
    expect(RequestBufferService.markAttempt).toHaveBeenCalledWith(
      'request-success',
    );
  });

  test('descarta uma requisição após o limite de tentativas', async () => {
    jest.mocked(RequestBufferService.peek).mockResolvedValue([
      { ...successfulRequest, attempts: 5 },
    ]);
    jest.mocked(RequestBufferService.remove).mockResolvedValue(true);

    const processed = await BufferWorkerService.flushOnce();

    expect(processed).toBe(0);
    expect(RequestBufferService.remove).toHaveBeenCalledWith(
      'request-success',
    );
  });
});
