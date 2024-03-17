import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from 'src/ticket/ticket.entity';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ErrorCodes, ExchangeName, OrderCancelledEvent, OrderCreatedEvent, QueueName, RoutingKey, TicketUpdatedEvent } from '@ssticketmicroservice/common';

const { TICKET, ORDER } = ExchangeName;
const { ORDER_CREATED, TICKET_UPDATED, ORDER_CANCELLED } = RoutingKey;
const { ORDER_CREATED_TICKET_SERVICE, ORDER_CANCELLED_TICKET_SERVICE } = QueueName;

@Injectable()
export class OrderSubscriber {
  constructor(@InjectRepository(Ticket) private ticketRepository: Repository<Ticket>, private readonly amqpConnection: AmqpConnection) {}

  @RabbitSubscribe({ exchange: ORDER, routingKey: ORDER_CREATED, queue: ORDER_CREATED_TICKET_SERVICE })
  async assignOrder(data: OrderCreatedEvent) {
    const ticket = await this.ticketRepository.findOneBy({ id: data.ticket.id });
    if (!ticket) {
      throw new HttpException(ErrorCodes.TICKET_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    ticket.orderId = data.id;
    const updatedTicket = await this.ticketRepository.save(ticket);

    this.amqpConnection.publish<TicketUpdatedEvent>(TICKET, TICKET_UPDATED, {
      id: updatedTicket.id,
      title: updatedTicket.title,
      price: updatedTicket.price,
      userId: updatedTicket.userId,
      orderId: updatedTicket.orderId,
      version: updatedTicket.version,
    });
  }

  @RabbitSubscribe({ exchange: ORDER, routingKey: ORDER_CANCELLED, queue: ORDER_CANCELLED_TICKET_SERVICE })
  async cancelOrder(data: OrderCancelledEvent) {
    const ticket = await this.ticketRepository.findOneBy({ id: data.ticket.id });
    if (!ticket) {
      throw new HttpException(ErrorCodes.TICKET_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    ticket.orderId = null;
    const updatedTicket = await this.ticketRepository.save(ticket);

    this.amqpConnection.publish<TicketUpdatedEvent>(TICKET, TICKET_UPDATED, {
      id: updatedTicket.id,
      title: updatedTicket.title,
      price: updatedTicket.price,
      userId: updatedTicket.userId,
      orderId: updatedTicket.orderId,
      version: updatedTicket.version,
    });
  }
}
