import * as dotenv from 'dotenv';

dotenv.config();

export const Config = {
  port: Number(process.env.PORT),
  rabbitmqUrl: process.env.RABBITMQ_URL,
  redisqUrl: process.env.REDIS_URL,
  clientUrl: process.env.CLIENT_URL,
  serviceName: process.env.SERVICE_NAME,
  envMode: process.env.NODE_ENV,
};
