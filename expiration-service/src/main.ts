import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Config } from './app.config';

async function bootstrap() {
  const logger = new Logger(Config.serviceName);
  const port = Config.port;

  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(port, 'localhost');
    logger.log(`Server is running on port: ${port}, env: ${Config.envMode}`);
  } catch (error) {
    logger.error(error);
  }
}
bootstrap();
