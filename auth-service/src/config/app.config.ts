import * as dotenv from 'dotenv';
import { User } from 'src/user/user.entity';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export const Config = {
  port: Number(process.env.PORT),
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
    // entities: ['**/*.entity.js'],
    entities: [User],
    migrations: ['dist/migrations/*.js'],
  } as DataSourceOptions,
};
