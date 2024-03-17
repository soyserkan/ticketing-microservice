import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ExpirationSubcriber } from './expiration.subscriber';
import { Order } from 'src/order/order.entity';
import { ExchangeName } from '@ssticketmicroservice/common';
import { Config } from 'src/config/app.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: ExchangeName.EXPIRATION,
          type: 'topic',
        },
        {
          name: ExchangeName.ORDER,
          type: 'topic',
        },
      ],
      uri: Config.rabbitmqUrl,
    }),
  ],
  providers: [ExpirationSubcriber],
})
export class ExpirationModule {}
