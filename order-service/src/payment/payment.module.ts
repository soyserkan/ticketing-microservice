import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Order } from 'src/order/order.entity';
import { ExchangeName } from '@ssticketmicroservice/common';
import { Config } from 'src/config/app.config';
import { PaymentSubcriber } from './payment.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: ExchangeName.PAYMENT,
          type: 'topic',
        },
      ],
      uri: Config.rabbitmqUrl,
    }),
  ],
  providers: [PaymentSubcriber],
})
export class PaymentModule {}
