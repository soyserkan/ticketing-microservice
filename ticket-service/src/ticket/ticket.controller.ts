import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketService } from './ticket.service';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CurrentUser, JwtServicePayload } from '@ssticketmicroservice/common';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createTicket(@Body() createTicketDto: CreateTicketDto, @CurrentUser() currentUser: JwtServicePayload) {
    //return this.ticketService.testTicket();
    //return this.ticketService.occTest();
    return this.ticketService.createTicket(createTicketDto, currentUser);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getTickets() {
    return this.ticketService.getTickets();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getTicket(@Param('id') ticketId: number) {
    return this.ticketService.getTicket(ticketId);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  async updateTicket(@Param('id') ticketId: number, @Body() updateTicketDto: UpdateTicketDto, @CurrentUser() currentUser: JwtServicePayload) {
    return this.ticketService.updateTicket(ticketId, updateTicketDto, currentUser);
  }
}
