import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ConfigService } from '../../config/config.service';
import { JwtAuthService } from './jwt-auth.service';

@Injectable()
export class JwtInternalAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject('JwtAuthService') private readonly authService: JwtAuthService,
    @Inject('ConfigService') private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token = context.switchToHttp().getRequest<Request>().header('authorization');

    if (token) token = token.substring(7);

    const cookies = context.switchToHttp().getRequest<Request>().cookies;
    if (!token && cookies) {
      token = context.switchToHttp().getRequest<Request>().cookies[
        this.configService.authCookieName
      ];
    }
    if (token) {
      const verified = await this.authService.verifyInternalToken(token);
      if (verified) {
        return true;
      }
    }

    throw new UnauthorizedException();
  }
}
