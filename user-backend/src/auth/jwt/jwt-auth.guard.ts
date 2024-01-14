import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ConfigService } from '../../config/config.service';
import { JwtAuthService } from './jwt-auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject('JwtAuthService') private readonly authService: JwtAuthService,
    @Inject('ConfigService') private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.configService.jwt.ignore) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    let token = req.cookies[this.configService.authCookieName] as string | undefined;
    if (!token) {
      token = req.header('authorization')?.substring(7);
    }

    if (token) {
      const verified = await this.authService.verifyToken(token);
      if (verified) {
        return true;
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
