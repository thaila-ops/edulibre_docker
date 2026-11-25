import sequelize from '../config/database';
import { redisClient } from '../config/redis';

type DependencyStatus = 'up' | 'down';

async function within<T>(operation: Promise<T>, timeoutMs = 2_000): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Tempo limite excedido.')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default class HealthService {
  public static async readiness() {
    const database = await this.checkDatabase();
    const redis = await this.checkRedis();
    const payment = await this.checkPayment();
    const dependencies = { database, redis, payment };
    const healthy = Object.values(dependencies).every((dependency) => dependency.status === 'up');

    return {
      healthy,
      checkedAt: new Date().toISOString(),
      dependencies,
    };
  }

  private static async checkDatabase() {
    try {
      await within(sequelize.authenticate());
      return { status: 'up' as DependencyStatus };
    } catch {
      return { status: 'down' as DependencyStatus };
    }
  }

  private static async checkRedis() {
    try {
      if (!redisClient.isReady) throw new Error('Redis não conectado.');
      await within(redisClient.ping());
      return { status: 'up' as DependencyStatus };
    } catch {
      return { status: 'down' as DependencyStatus };
    }
  }

  private static async checkPayment() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2_000);
    try {
      const response = await fetch(
        `${process.env.PAYMENT_SERVICE_URL ?? 'http://pagamento-service:3002'}/health`,
        { signal: controller.signal },
      );
      return { status: response.ok ? 'up' as DependencyStatus : 'down' as DependencyStatus };
    } catch {
      return { status: 'down' as DependencyStatus };
    } finally {
      clearTimeout(timer);
    }
  }
}
