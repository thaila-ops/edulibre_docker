import HttpError from '../utils/http-error';

export type PaymentMethod = 'pix' | 'card';

export type PaymentPayload = {
  method: PaymentMethod;
  cardNumber?: string;
  cardHolder?: string;
};

type PaymentSimulationResponse = {
  transactionId: string;
  status: 'approved' | 'declined';
  message: string;
};

export default class PaymentClientService {
  private static consecutiveFailures = 0;
  private static circuitOpenUntil = 0;
  private static readonly failureThreshold = 3;
  private static readonly circuitCooldownMs = 30_000;

  public static async simulate(
    bookingId: number,
    amount: number,
    payload: PaymentPayload,
  ) {
    if (Date.now() < this.circuitOpenUntil) {
      throw new HttpError(
        503,
        'O serviço de pagamentos está em recuperação. Tente novamente em instantes.',
      );
    }

    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const result = await this.requestSimulation(bookingId, amount, payload);
        this.consecutiveFailures = 0;
        this.circuitOpenUntil = 0;
        return result;
      } catch (error) {
        lastError = error;
        if (error instanceof HttpError && error.statusCode < 500) throw error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }

    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.circuitOpenUntil = Date.now() + this.circuitCooldownMs;
      console.warn('[Pagamentos] Circuit breaker aberto por 30 segundos.');
    }

    if (lastError instanceof HttpError) throw lastError;
    throw new HttpError(503, 'O serviço de pagamentos está indisponível. Tente novamente.');
  }

  private static async requestSimulation(
    bookingId: number,
    amount: number,
    payload: PaymentPayload,
  ) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    try {
      const response = await fetch(
        `${process.env.PAYMENT_SERVICE_URL ?? 'http://pagamento-service:3002'}/payments/simulate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, amount, ...payload }),
          signal: controller.signal,
        },
      );

      const result = (await response.json()) as PaymentSimulationResponse & {
        message?: string | string[];
      };

      if (!response.ok) {
        const message = Array.isArray(result.message)
          ? result.message.join(' ')
          : result.message;
        throw new HttpError(400, message ?? 'Não foi possível validar o pagamento.');
      }

      return result;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        503,
        'O serviço de pagamentos está indisponível. Tente novamente.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
