import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Repository } from 'typeorm';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName, RoutingKey, QueueName, TicketCreatedEvent, TicketUpdatedEvent } from '@ssticketmicroservice/common';

const { TICKET } = ExchangeName;
const { TICKET_CREATED, TICKET_UPDATED } = RoutingKey;
const { TICKET_CREATED_ORDER_SERVICE, TICKET_UPDATED_ORDER_SERVICE } = QueueName;

@Injectable()
export class TicketSubcriber {
  constructor(@InjectRepository(Ticket) private ticketRepository: Repository<Ticket>) {}

  @RabbitSubscribe({ exchange: TICKET, routingKey: TICKET_CREATED, queue: TICKET_CREATED_ORDER_SERVICE })
  async createTicket(data: TicketCreatedEvent) {
    const ticket = this.ticketRepository.create({
      id: data.id,
      title: data.title,
      price: data.price,
    });
    await this.ticketRepository.save(ticket);
  }

  @RabbitSubscribe({ exchange: TICKET, routingKey: TICKET_UPDATED, queue: TICKET_UPDATED_ORDER_SERVICE })
  async updateTicket(data: TicketUpdatedEvent) {
    const ticket = await this.ticketRepository.findOneBy({ id: data.id, version: data.version - 1 });
    if (!ticket) {
      return;
    }

    await this.ticketRepository.save({ ...ticket, title: data.title, price: data.price });
  }
}
