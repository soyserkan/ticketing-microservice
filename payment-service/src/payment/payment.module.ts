import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { PaymentController } from './payment.controller';
import { JwtModule } from '@nestjs/jwt';
import { Config } from 'src/config/app.config';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@ssticketmicroservice/common';
import { Order } from 'src/order/order.entity';
import { PaymentService } from './payment.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { Payment } from './payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Payment]),
    JwtModule.registerAsync({
      useFactory: () => ({ secret: Config.jwt.privateKey, signOptions: { expiresIn: Config.jwt.expires } }),
      inject: [ConfigService],
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: ExchangeName.PAYMENT,
          type: 'topic',
        },
      ],
      uri: Config.rabbitmqUrl,
    }),
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>('STRIPE_API_KEY'),
        options: {
          apiVersion: '2023-10-16',
        },
      }),
    }),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class PaymentModule {}
