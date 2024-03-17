import { OptimisticLockingSubscriber } from '@ssticketmicroservice/common';
import * as dotenv from 'dotenv';
import { Order } from 'src/order/order.entity';
import { Ticket } from 'src/ticket/ticket.entity';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export const Config = {
  port: Number(process.env.PORT),
  orderExpirationSeconds: Number(process.env.ORDER_EXPIRE_SECONDS),
  rabbitmqUrl: process.env.RABBITMQ_URL,
  clientUrl: process.env.CLIENT_URL,
  serviceName: process.env.SERVICE_NAME,
  envMode: process.env.NODE_ENV,
  bcryptSalt: Number(process.env.BCRYPT_SALT),
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY,
    expires: process.env.JWT_EXPIRES,
  },
  database: {
    type: 'postgres',
    synchronize: false,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    entities: [Order, Ticket],
    subscribers: [OptimisticLockingSubscriber],
    migrations: ['dist/migrations/*.js'],
  } as DataSourceOptions,
};
