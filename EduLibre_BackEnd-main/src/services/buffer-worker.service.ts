import RequestBufferService, {
  type BufferedRequest,
} from './request-buffer.service';

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_REQUEST_TIMEOUT_MS = 3000;
const MAX_ATTEMPTS = 5;

type WorkerOptions = {
  batchSize?: number;
  intervalMs?: number;
  requestTimeoutMs?: number;
  targetUrls?: Record<string, string>;
};

const DEFAULT_TARGET_URLS: Record<string, string> = {
  pagamento: 'http://pagamento:3002',
  media: 'http://media_optimization:3000',
};

export default class BufferWorkerService {
  private static timer: NodeJS.Timeout | null = null;
  private static running = false;

  public static async processRequest(
    request: BufferedRequest,
    targetUrls: Record<string, string>,
    requestTimeoutMs: number,
  ): Promise<boolean> {
    const baseUrl = targetUrls[request.target];
    if (!baseUrl) {
      console.warn(
        `[Buffer Worker] Target desconhecido: ${request.target}; ` +
          `requestId=${request.id}`,
      );
      return false;
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      requestTimeoutMs,
    );

    try {
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}${request.path}`,
        {
          method: request.method,
          headers: request.body
            ? { 'Content-Type': 'application/json' }
            : undefined,
          body: request.body === null
            ? undefined
            : JSON.stringify(request.body),
          signal: controller.signal,
        },
      );

      if (response.ok) {
        await RequestBufferService.remove(request.id);
        console.info(
          `[Buffer Worker] FLUSH OK: id=${request.id}; ` +
            `target=${request.target}; status=${response.status}`,
        );
        return true;
      }

      await RequestBufferService.markAttempt(request.id);
      console.warn(
        `[Buffer Worker] FLUSH FAIL: id=${request.id}; ` +
          `target=${request.target}; status=${response.status}`,
      );
      return false;
    } catch (error) {
      await RequestBufferService.markAttempt(request.id);
      console.warn(
        `[Buffer Worker] FLUSH ERROR: id=${request.id}; ` +
          `target=${request.target}; ` +
          `erro=${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  public static async flushOnce(options: WorkerOptions = {}): Promise<number> {
    const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
    const requestTimeoutMs =
      options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const targetUrls = options.targetUrls ?? DEFAULT_TARGET_URLS;

    const requests = await RequestBufferService.peek(batchSize);
    let processed = 0;

    for (const request of requests) {
      if (request.attempts >= MAX_ATTEMPTS) {
        await RequestBufferService.remove(request.id);
        console.warn(
          `[Buffer Worker] DESCARTADO: id=${request.id}; ` +
            `tentativas=${request.attempts}`,
        );
        continue;
      }

      const success = await BufferWorkerService.processRequest(
        request,
        targetUrls,
        requestTimeoutMs,
      );
      if (success) processed += 1;
    }

    if (requests.length > 0) {
      console.info(
        `[Buffer Worker] LOTE: tamanho=${requests.length}; ` +
          `reenviados=${processed}`,
      );
    }

    return processed;
  }

  public static start(options: WorkerOptions = {}): void {
    if (BufferWorkerService.timer) return;

    const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;

    void BufferWorkerService.flushOnce(options);
    BufferWorkerService.timer = setInterval(() => {
      if (BufferWorkerService.running) return;

      BufferWorkerService.running = true;
      void BufferWorkerService.flushOnce(options).finally(() => {
        BufferWorkerService.running = false;
      });
    }, intervalMs);

    console.info(
      `[Buffer Worker] iniciado; intervalo=${intervalMs}ms`,
    );
  }

  public static stop(): void {
    if (BufferWorkerService.timer) {
      clearInterval(BufferWorkerService.timer);
      BufferWorkerService.timer = null;
    }
  }
}
