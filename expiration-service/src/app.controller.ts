import { Controller } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ExchangeName, ExpirationCompletedEvent, OrderCreatedEvent, QueueName, RoutingKey } from '@ssticketmicroservice/common';

const { ORDER, EXPIRATION } = ExchangeName;
const { ORDER_CREATED, EXPIRATION_COMPLETED } = RoutingKey;
const { ORDER_CREATED_EXPIRATION_SERVICE } = QueueName;

@Controller()
export class AppController {
  constructor(@InjectRedis() private readonly redis: Redis, private readonly amqpConnection: AmqpConnection) {
    this.redis.config('SET', 'notify-keyspace-events', 'Ex');

    const sub = this.redis.duplicate();
    sub.subscribe('__keyevent@0__:expired');
    sub.on('message', async (event: string, key: string) => {
      this.amqpConnection.publish<ExpirationCompletedEvent>(EXPIRATION, EXPIRATION_COMPLETED, {
        orderId: parseInt(key),
      });
    });
  }

  @RabbitSubscribe({ exchange: ORDER, routingKey: ORDER_CREATED, queue: ORDER_CREATED_EXPIRATION_SERVICE })
  async lockOrder(data: OrderCreatedEvent) {
    const keyExpiredTime = new Date(data.expiresAt).getTime();
    const nowTime = new Date().getTime();
    const ttl = keyExpiredTime - nowTime;

    await this.redis.set(data.id.toString(), '', 'PX', ttl);
  }
}
