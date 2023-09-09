import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt']) {
  constructor(private readonly reflector: Reflector) {
    super({
      passReqToCallback: true,
    });
  }

  canActivate(context: ExecutionContext) {
    const noAuth = this.reflector.get<boolean>('no-auth', context.getHandler());

    if (noAuth) return true;
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
