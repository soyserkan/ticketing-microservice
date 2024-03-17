import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ErrorCodes, ExchangeName, JwtServicePayload, OrderStatus, PaymentCreatedEvent, RoutingKey } from '@ssticketmicroservice/common';
import { Order } from 'src/order/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    private readonly amqpConnection: AmqpConnection,
    private readonly stripeService: StripeService,
  ) {}

  async createPayment(payment: CreatePaymentDto, currentUser: JwtServicePayload) {
    const order = await this.orderRepository.findOneBy({ id: payment.orderId });
    if (!order) {
      throw new HttpException(ErrorCodes.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (order.userId !== currentUser.id) {
      throw new HttpException(ErrorCodes.NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new HttpException(ErrorCodes.ORDER_CANCELLED, HttpStatus.BAD_REQUEST);
    }

    const charge = await this.stripeService.stripe.charges.create({ currency: 'try', amount: order.price * 100, source: payment.token });
    const createdPayment = this.paymentRepository.create({ orderId: order.id, stripeId: charge.id });
    await this.paymentRepository.save(createdPayment);

    await this.amqpConnection.publish<PaymentCreatedEvent>(ExchangeName.PAYMENT, RoutingKey.PAYMENT_CREATED, {
      id: createdPayment.id,
      orderId: createdPayment.orderId,
      stripeId: createdPayment.stripeId,
    });

    return { id: createdPayment.id };
  }
}
