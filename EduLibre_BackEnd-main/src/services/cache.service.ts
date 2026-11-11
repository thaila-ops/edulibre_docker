import { redisClient } from '../config/redis';
import { randomUUID } from 'node:crypto';

const COMMAND_TIMEOUT_MS = 500;
const DEFAULT_TTL_SECONDS = 60;

export default class CacheService {
  public static async get<T>(key: string): Promise<T | null> {
    if (!redisClient.isReady) {
      console.warn('[Cache] Redis indisponível; consulta sem cache.');
      return null;
    }

    try {
      const cached = await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .get(key);

      if (cached === null) {
        console.info(`[Cache] MISS: ${key}`);
        return null;
      }

      const value = JSON.parse(cached) as T;

      console.info(`[Cache] HIT: ${key}`);
      return value;
    } catch (error) {
      console.warn(
        `[Cache] Falha ao ler ${key}:`,
        error instanceof Error ? error.message : 'Erro desconhecido',
      );

      return null;
    }
  }

  public static async set<T>(key: string, value: T): Promise<void> {
    if (!redisClient.isReady) {
      return;
    }

    try {
      const ttl = Number(process.env.CACHE_TTL_SECONDS ?? DEFAULT_TTL_SECONDS);

      if (!Number.isSafeInteger(ttl) || ttl <= 0) {
        throw new Error('CACHE_TTL_SECONDS deve ser um inteiro positivo.');
      }

      const serialized = JSON.stringify(value);

      if (serialized === undefined) {
        throw new Error('O valor não pode ser convertido para JSON.');
      }

      await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .set(key, serialized, { EX: ttl });

      console.info(`[Cache] SET: ${key}; TTL: ${ttl}s`);
    } catch (error) {
      console.warn(
        `[Cache] Falha ao gravar ${key}:`,
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }
  public static async invalidate(namespace: string): Promise<boolean> {
    if (!redisClient.isReady) {
      console.warn(`[Cache] Invalidação indisponível: ${namespace}`);
      return false;
    }

    try {
      const versionKey = CacheService.versionKey(namespace);

      await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .set(versionKey, randomUUID());

      console.info(`[Cache] INVALIDATE: ${namespace}`);
      return true;
    } catch (error) {
      console.warn(
        `[Cache] Falha ao invalidar ${namespace}:`,
        error instanceof Error ? error.message : 'Erro desconhecido',
      );

      return false;
    }
  }
  public static async getVersion(namespace: string): Promise<string | null> {
    if (!redisClient.isReady) {
      return null;
    }

    try {
      const versionKey = CacheService.versionKey(namespace);

      const version = await redisClient
        .withCommandOptions({ timeout: COMMAND_TIMEOUT_MS })
        .get(versionKey);

      return version ?? 'initial';
    } catch (error) {
      console.warn(
        `[Cache] Falha ao consultar versão de ${namespace}:`,
        error instanceof Error ? error.message : 'Erro desconhecido',
      );

      return null;
    }
  }
  private static versionKey(namespace: string): string {
    return `edulibre:cache-version:${namespace}`;
  }
}
