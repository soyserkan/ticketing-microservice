import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { TicketController } from './ticket.controller';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';
import { JwtModule } from '@nestjs/jwt';
import { Config } from 'src/config/app.config';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@ssticketmicroservice/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    JwtModule.registerAsync({
      useFactory: () => ({ secret: Config.jwt.privateKey, signOptions: { expiresIn: Config.jwt.expires } }),
      inject: [ConfigService],
    }),
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
  controllers: [TicketController],
  providers: [
    TicketService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class TicketModule {}
