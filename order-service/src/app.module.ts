import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config/app.config';
import { OrderModule } from './order/order.module';
import { TicketModule } from './ticket/ticket.module';
import { ExpirationModule } from './expiration/expiration.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(Config.database), OrderModule, TicketModule, ExpirationModule, PaymentModule],
})
export class AppModule {}
