import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';

type SimulatePaymentBody = {
  bookingId?: number;
  amount?: number;
  method?: 'pix' | 'card';
  cardNumber?: string;
  cardHolder?: string;
};

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('simulate')
  simulate(@Body() payload: SimulatePaymentBody) {
    return this.paymentsService.simulate(payload);
  }
}
