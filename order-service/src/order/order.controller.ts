import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { CurrentUser, JwtServicePayload } from '@ssticketmicroservice/common';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto, @CurrentUser() currentUser: JwtServicePayload) {
    return this.orderService.createOrder(createOrderDto, currentUser);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getOrders(@CurrentUser() currentUser: JwtServicePayload) {
    return this.orderService.getOrders(currentUser);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getOrder(@Param('id') orderId: number, @CurrentUser() currentUser: JwtServicePayload) {
    return this.orderService.getOrder(orderId, currentUser);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelOrder(@Param('id') orderId: number, @CurrentUser() currentUser: JwtServicePayload) {
    return this.orderService.deleteOrder(orderId, currentUser);
  }
}
