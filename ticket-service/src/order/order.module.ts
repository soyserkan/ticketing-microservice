import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/ticket/ticket.entity';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { OrderSubscriber } from './order.subscriber';
import { Config } from 'src/config/app.config';
import { ExchangeName } from '@ssticketmicroservice/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: ExchangeName.ORDER,
          type: 'topic',
        },
        {
          name: ExchangeName.TICKET,
          type: 'topic',
        },
      ],
      uri: Config.rabbitmqUrl,
    }),
  ],
  providers: [OrderSubscriber],
})
export class OrderModule {}
