import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './ticket.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ErrorCodes, ExchangeName, JwtServicePayload, RoutingKey, TicketCreatedEvent, TicketUpdatedEvent } from '@ssticketmicroservice/common';

const { TICKET } = ExchangeName;
const { TICKET_CREATED, TICKET_UPDATED } = RoutingKey;

@Injectable()
export class TicketService {
  constructor(@InjectRepository(Ticket) private ticketRepository: Repository<Ticket>, private readonly amqpConnection: AmqpConnection) {}

  async createTicket(ticket: CreateTicketDto, currentUser: JwtServicePayload) {
    const createTicket = this.ticketRepository.create({
      title: ticket.title,
      price: ticket.price,
      userId: currentUser.id,
    });
    const createdTicket = await this.ticketRepository.save(createTicket);
    this.amqpConnection.publish<TicketCreatedEvent>(TICKET, TICKET_CREATED, {
      id: createdTicket.id,
      title: createdTicket.title,
      price: createdTicket.price,
      userId: createdTicket.userId,
      version: createdTicket.version,
    });

    return createdTicket;
  }

  async getTickets() {
    const tickets = await this.ticketRepository.find();
    return tickets;
  }

  async getTicket(ticketId: number) {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new HttpException(ErrorCodes.TICKET_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return ticket;
  }

  async updateTicket(ticketId: number, ticketObject: UpdateTicketDto, currentUser: JwtServicePayload) {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new HttpException(ErrorCodes.TICKET_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (ticket.orderId) {
      throw new HttpException(ErrorCodes.TICKET_RESERVED, HttpStatus.BAD_REQUEST);
    }

    if (ticket.userId !== currentUser.id) {
      throw new HttpException(ErrorCodes.NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const updatedTicket = await this.ticketRepository.save({ ...ticket, title: ticketObject.title, price: ticketObject.price });
    this.amqpConnection.publish<TicketUpdatedEvent>(TICKET, TICKET_UPDATED, {
      id: updatedTicket.id,
      title: updatedTicket.title,
      price: updatedTicket.price,
      userId: updatedTicket.userId,
      version: updatedTicket.version,
    });
    return updatedTicket;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async testTicket() {
    for (let i = 0; i < 1000; i++) {
      const ticket = {
        title: `test ticket + ${this.getRandomInt(1, 1000)}`,
        price: 5,
      };
      const currentUser = {
        id: this.getRandomInt(1, 1000),
        email: `test${this.getRandomInt(1, 1000)}@test.com`,
      };
      const created = await this.createTicket(ticket, currentUser);
      if (created) {
        await this.updateTicket(created.id, { title: `updated test ticket + ${this.getRandomInt(1, 1000)}`, price: 10 }, currentUser);
        await this.updateTicket(created.id, { title: `updated test ticket2 + ${this.getRandomInt(1, 1000)}`, price: 15 }, currentUser);
      }
    }
    return true;
  }

  async occTest() {
    try {
      const createTicket = this.ticketRepository.create({
        title: 'test ticket',
        price: 5,
        userId: 1,
      });
      const createdTicket = await this.ticketRepository.save(createTicket);
      const ticket1 = await this.ticketRepository.findOne({ where: { id: createdTicket.id } });
      const ticket2 = await this.ticketRepository.findOne({ where: { id: createdTicket.id } });

      ticket1.price = 10;
      ticket2.price = 15;

      await this.ticketRepository.save(ticket1);
      await this.ticketRepository.save(ticket2);
    } catch (error) {
      debugger;
    }
  }
}
