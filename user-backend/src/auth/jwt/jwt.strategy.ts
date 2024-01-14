import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { ConfigService } from '../../config/config.service';
import { JwtAuthService } from './jwt-auth.service';

const extratorFactory = (configService: ConfigService) => (req: Request) => {
  let token = req.header('authorization');

  if (token) {
    token = token.substring(7);
  }

  const cookies = req.cookies;
  if (!token && cookies) {
    token = req.cookies[configService.authCookieName];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: JwtAuthService, private configService: ConfigService) {
    super({
      jwtFromRequest: extratorFactory(configService),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.jwtSecret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    username: string;
    iat: number;
  }): Promise<{ id: string; email: string; username: string }> {
    if (
      !this.configService.jwt.ignore &&
      !(await this.authService.checkLogoutTime(payload.sub, payload.iat))
    ) {
      throw new UnauthorizedException();
    }

    return { id: payload.sub, email: payload.email, username: payload.username };
  }
}
