import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Config } from './config/app.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExceptionMiddleware, ResponseInterceptor } from '@ssticketmicroservice/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieSession = require('cookie-session');

async function bootstrap() {
  const logger = new Logger(Config.serviceName);
  const port = Config.port;

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalFilters(new ExceptionMiddleware(logger));
    app.useGlobalInterceptors(new ResponseInterceptor(logger));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true }));
    app.enableCors({ origin: Config.clientUrl, credentials: true });
    app.use(helmet());

    const sessionOption: CookieSessionInterfaces.CookieSessionOptions = { signed: false, secure: false };
    if (Config.envMode === 'production') {
      app.set('trust proxy', true);
      sessionOption.secure = true;
    }
    app.use(cookieSession(sessionOption));

    await app.listen(port, 'localhost');

    logger.log(`Server is running on port: ${port}, env: ${Config.envMode}`);
  } catch (error) {
    logger.error(error);
  }
}
bootstrap();
