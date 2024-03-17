import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { CurrentUser, JwtServicePayload } from '@ssticketmicroservice/common';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() currentUser: JwtServicePayload) {
    return this.paymentService.createPayment(createPaymentDto, currentUser);
  }
}
