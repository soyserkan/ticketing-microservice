import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Order } from 'src/order/order.entity';
import { ErrorCodes, ExchangeName, ExpirationCompletedEvent, OrderCancelledEvent, OrderStatus, QueueName, RoutingKey } from '@ssticketmicroservice/common';

const { EXPIRATION, ORDER } = ExchangeName;
const { EXPIRATION_COMPLETED, ORDER_CANCELLED } = RoutingKey;
const { EXPIRATION_COMPLETED_ORDER_SERVICE } = QueueName;

@Injectable()
export class ExpirationSubcriber {
  constructor(@InjectRepository(Order) private orderRepository: Repository<Order>, private readonly amqpConnection: AmqpConnection) {}

  @RabbitSubscribe({ exchange: EXPIRATION, routingKey: EXPIRATION_COMPLETED, queue: EXPIRATION_COMPLETED_ORDER_SERVICE })
  async expirationCompleted(data: ExpirationCompletedEvent) {
    const order = await this.orderRepository.findOne({ where: { id: data.orderId }, relations: ['ticket'] });
    if (!order) {
      throw new HttpException(ErrorCodes.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (order.status === OrderStatus.Complete) {
      return;
    }

    order.status = OrderStatus.Cancelled;
    await this.orderRepository.save(order);

    this.amqpConnection.publish<OrderCancelledEvent>(ORDER, ORDER_CANCELLED, {
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
  }
}
