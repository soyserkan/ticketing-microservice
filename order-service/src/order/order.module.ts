import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { JwtModule } from '@nestjs/jwt';
import { Config } from 'src/config/app.config';
import { ConfigService } from '@nestjs/config';
import { Ticket } from 'src/ticket/ticket.entity';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@ssticketmicroservice/common';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Ticket]),
    JwtModule.registerAsync({
      useFactory: () => ({ secret: Config.jwt.privateKey, signOptions: { expiresIn: Config.jwt.expires } }),
      inject: [ConfigService],
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: ExchangeName.ORDER,
          type: 'topic',
        },
      ],
      uri: Config.rabbitmqUrl,
    }),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class OrderModule {}
