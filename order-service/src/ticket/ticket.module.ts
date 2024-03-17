import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TicketSubcriber } from './ticket.subscriber';
import { ExchangeName } from '@ssticketmicroservice/common';
import { Config } from 'src/config/app.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: ExchangeName.TICKET,
          type: 'topic',
        },
      ],
      uri: Config.rabbitmqUrl,
    }),
  ],
  providers: [TicketSubcriber],
})
export class TicketModule {}
