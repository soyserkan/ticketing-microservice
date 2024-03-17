import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ErrorCodes, IS_PUBLIC_KEY } from '@ssticketmicroservice/common';
import { Config } from 'src/config/app.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const type = context.getType<'rmq'>();
    if (type === 'rmq') {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      const payload = await this.jwtService.verifyAsync(request.session.jwt, { secret: Config.jwt.privateKey });
      request.currentUser = payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException(ErrorCodes.AUTHENTICATION_TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(ErrorCodes.INVALID_AUTHENTICATION_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
