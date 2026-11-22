import { randomUUID } from 'node:crypto';
import { redisClient } from '../config/redis';

const BUFFER_KEY = 'edulibre:buffer:requests';
const COMMAND_TIMEOUT_MS = 500;

export type BufferedRequest = {
  id: string;
  target: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body: unknown;
  createdAt: string;
  attempts: number;
};

export default class RequestBufferService {
  public static async enqueue(
    target: string,
    method: BufferedRequest['method'],
    path: string,
    body: unknown = null,
  ): Promise<BufferedRequest | null> {
    if (!redisClient.isReady) {
      console.warn('[Buffer] Redis indisponível; requisição não enfileirada.');
      return null;
    }

    const request: BufferedRequest = {
      id: randomUUID(),
      target,
      method,
      path,
      body,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    try {
      await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .rPush(BUFFER_KEY, JSON.stringify(request));

      console.info(
        `[Buffer] ENQUEUE: id=${request.id}; target=${target}; ` +
          `method=${method}; path=${path}`,
      );
      return request;
    } catch (error) {
      console.warn(
        '[Buffer] Falha ao enfileirar requisição:',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      return null;
    }
  }

  public static async size(): Promise<number> {
    if (!redisClient.isReady) return 0;

    try {
      return await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .lLen(BUFFER_KEY);
    } catch (error) {
      console.warn(
        '[Buffer] Falha ao consultar tamanho:',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      return 0;
    }
  }

  public static async peek(limit = 10): Promise<BufferedRequest[]> {
    if (!redisClient.isReady) return [];

    const boundedLimit = Number.isSafeInteger(limit) && limit > 0
      ? Math.min(limit, 100)
      : 10;

    try {
      const rawRequests = await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .lRange(BUFFER_KEY, 0, boundedLimit - 1);

      return rawRequests
        .map((raw) => {
          try {
            return JSON.parse(raw) as BufferedRequest;
          } catch {
            console.warn('[Buffer] Entrada inválida ignorada.');
            return null;
          }
        })
        .filter((request): request is BufferedRequest => request !== null);
    } catch (error) {
      console.warn(
        '[Buffer] Falha ao listar buffer:',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      return [];
    }
  }

  public static async remove(requestId: string): Promise<boolean> {
    if (!redisClient.isReady) return false;

    try {
      const rawRequests = await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .lRange(BUFFER_KEY, 0, -1);

      for (const raw of rawRequests) {
        let request: BufferedRequest;
        try {
          request = JSON.parse(raw) as BufferedRequest;
        } catch {
          continue;
        }
        if (request.id === requestId) {
          await redisClient
            .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
            .lRem(BUFFER_KEY, 1, raw);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn(
        '[Buffer] Falha ao remover requisição:',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      return false;
    }
  }

  public static async markAttempt(requestId: string): Promise<boolean> {
    if (!redisClient.isReady) return false;

    try {
      const rawRequests = await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .lRange(BUFFER_KEY, 0, -1);

      for (let index = 0; index < rawRequests.length; index += 1) {
        const raw = rawRequests[index];
        const request = JSON.parse(raw) as BufferedRequest;
        if (request.id === requestId) {
          const updated = {
            ...request,
            attempts: request.attempts + 1,
          };
          await redisClient
            .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
            .lSet(BUFFER_KEY, index, JSON.stringify(updated));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn(
        '[Buffer] Falha ao atualizar tentativas:',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      return false;
    }
  }

  public static getKey(): string {
    return BUFFER_KEY;
  }
}
