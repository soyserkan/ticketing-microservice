import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Order } from 'src/order/order.entity';
import { ErrorCodes, ExchangeName, OrderStatus, PaymentCreatedEvent, QueueName, RoutingKey } from '@ssticketmicroservice/common';

const { PAYMENT } = ExchangeName;
const { PAYMENT_CREATED } = RoutingKey;
const { PAYMENT_CREATED_ORDER_SERVICE } = QueueName;

@Injectable()
export class PaymentSubcriber {
  constructor(@InjectRepository(Order) private orderRepository: Repository<Order>) {}

  @RabbitSubscribe({ exchange: PAYMENT, routingKey: PAYMENT_CREATED, queue: PAYMENT_CREATED_ORDER_SERVICE })
  async paymentCreated(data: PaymentCreatedEvent) {
    const order = await this.orderRepository.findOne({ where: { id: data.orderId } });
    if (!order) {
      throw new HttpException(ErrorCodes.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    order.status = OrderStatus.Complete;
    await this.orderRepository.save(order);
  }
}
