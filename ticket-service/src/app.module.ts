import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config/app.config';
import { TicketModule } from './ticket/ticket.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(Config.database), TicketModule, OrderModule],
  providers: [],
})
export class AppModule {}
