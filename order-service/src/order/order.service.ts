import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';
import { Ticket } from 'src/ticket/ticket.entity';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ErrorCodes, ExchangeName, JwtServicePayload, OrderCancelledEvent, OrderCreatedEvent, OrderStatus, RoutingKey } from '@ssticketmicroservice/common';
import { Config } from 'src/config/app.config';

const { Created, AwaitingPayment, Complete, Cancelled } = OrderStatus;

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async createOrder(ticketDto: CreateOrderDto, currentUser: JwtServicePayload) {
    const ticket = await this.ticketRepository.findOneBy({ id: ticketDto.ticketId });
    if (!ticket) {
      throw new HttpException(ErrorCodes.TICKET_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existingOrder = await this.orderRepository.findOne({ where: { ticket: { id: ticket.id }, status: In([Created, AwaitingPayment, Complete]) } });
    if (existingOrder && existingOrder.userId !== currentUser.id) {
      throw new HttpException(ErrorCodes.TICKET_ALREADY_RESERVED, HttpStatus.BAD_REQUEST);
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + Config.orderExpirationSeconds);

    const createOrder = this.orderRepository.create({
      status: Created,
      ticket,
      expiresAt: expiration.toISOString(),
      userId: currentUser.id,
    });
    await this.orderRepository.save(createOrder);

    this.amqpConnection.publish<OrderCreatedEvent>(ExchangeName.ORDER, RoutingKey.ORDER_CREATED, {
      id: createOrder.id,
      status: createOrder.status,
      userId: createOrder.userId,
      expiresAt: createOrder.expiresAt,
      ticket: {
        id: createOrder.ticket.id,
        price: createOrder.ticket.price,
      },
    });

    return createOrder;
  }

  async getOrders(currentUser: JwtServicePayload) {
    const orders = await this.orderRepository.find({ where: { userId: currentUser.id }, relations: ['ticket'] });
    return orders;
  }

  async getOrder(orderId: number, currentUser: JwtServicePayload) {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['ticket'] });
    if (!order) {
      throw new HttpException(ErrorCodes.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (order.userId !== currentUser.id) {
      throw new HttpException(ErrorCodes.NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    return order;
  }

  async cancelOrder(orderId: number, currentUser: JwtServicePayload) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new HttpException(ErrorCodes.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (order.userId !== currentUser.id) {
      throw new HttpException(ErrorCodes.NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    if (order.status !== Complete) {
      throw new HttpException(ErrorCodes.COMPLETED_ORDER_CANNOT_BE_CANCELLED, HttpStatus.UNAUTHORIZED);
    }

    order.status = Cancelled;
    await this.orderRepository.save(order);

    this.amqpConnection.publish<OrderCancelledEvent>(ExchangeName.ORDER, RoutingKey.ORDER_CANCELLED, {
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    return order;
  }
}
