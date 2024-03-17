import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Config } from './app.config';
import { ExchangeName } from '@ssticketmicroservice/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: ExchangeName.ORDER,
          type: 'topic',
        },
        {
          name: ExchangeName.EXPIRATION,
          type: 'topic',
        },
      ],
      uri: Config.rabbitmqUrl,
      enableControllerDiscovery: true,
    }),
    RedisModule.forRoot({ type: 'single', url: Config.redisqUrl }),
  ],
  controllers: [AppController],
})
export class AppModule {}
