import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

type SimulatePaymentPayload = {
  bookingId?: number;
  amount?: number;
  method?: 'pix' | 'card';
  cardNumber?: string;
  cardHolder?: string;
};

@Injectable()
export class PaymentsService {
  simulate(payload: SimulatePaymentPayload) {
    if (!Number.isInteger(payload.bookingId) || !payload.bookingId || payload.bookingId < 1) {
      throw new BadRequestException('Agendamento inválido.');
    }

    if (!Number.isFinite(payload.amount) || !payload.amount || payload.amount <= 0) {
      throw new BadRequestException('Valor do pagamento inválido.');
    }

    if (payload.method !== 'pix' && payload.method !== 'card') {
      throw new BadRequestException('Escolha Pix ou cartão para continuar.');
    }

    const digits = payload.cardNumber?.replace(/\D/g, '') ?? '';
    if (payload.method === 'card' && (digits.length < 13 || !payload.cardHolder?.trim())) {
      throw new BadRequestException('Informe os dados do cartão para a simulação.');
    }

    // Cenário demonstrável de recusa: cartões terminados em 0000.
    // Não há cobrança nem armazenamento de dados de cartão.
    const declined = payload.method === 'card' && digits.endsWith('0000');

    return {
      transactionId: randomUUID(),
      bookingId: payload.bookingId,
      amount: Number(payload.amount.toFixed(2)),
      method: payload.method,
      status: declined ? 'declined' : 'approved',
      processedAt: new Date().toISOString(),
      cardLastFour: payload.method === 'card' ? digits.slice(-4) : undefined,
      message: declined
        ? 'Pagamento simulado recusado. Tente outro cartão de teste.'
        : 'Pagamento simulado aprovado com sucesso.',
    };
  }
}
