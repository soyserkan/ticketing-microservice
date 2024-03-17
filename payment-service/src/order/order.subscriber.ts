import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ErrorCodes, ExchangeName, OrderCancelledEvent, OrderCreatedEvent, OrderStatus, QueueName, RoutingKey } from '@ssticketmicroservice/common';
import { Order } from './order.entity';

const { ORDER } = ExchangeName;
const { ORDER_CREATED, ORDER_CANCELLED } = RoutingKey;
const { ORDER_CREATED_PAYMENT_SERVICE, ORDER_CANCELLED_PAYMENT_SERVICE } = QueueName;

@Injectable()
export class OrderSubscriber {
  constructor(@InjectRepository(Order) private orderRepository: Repository<Order>, private readonly amqpConnection: AmqpConnection) {}

  @RabbitSubscribe({ exchange: ORDER, routingKey: ORDER_CREATED, queue: ORDER_CREATED_PAYMENT_SERVICE })
  async createOrder(data: OrderCreatedEvent) {
    const order = this.orderRepository.create({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await this.orderRepository.save(order);
  }

  @RabbitSubscribe({ exchange: ORDER, routingKey: ORDER_CANCELLED, queue: ORDER_CANCELLED_PAYMENT_SERVICE })
  async cancelOrder(data: OrderCancelledEvent) {
    const order = await this.orderRepository.findOneBy({ id: data.id, version: data.version - 1 });
    if (!order) {
      throw new HttpException(ErrorCodes.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    order.status = OrderStatus.Cancelled;
    await this.orderRepository.save(order);
  }
}
