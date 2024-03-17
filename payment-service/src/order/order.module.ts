import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@ssticketmicroservice/common';
import { Config } from 'src/config/app.config';
import { Order } from './order.entity';
import { OrderSubscriber } from './order.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
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
  providers: [OrderSubscriber],
})
export class OrderModule {}
