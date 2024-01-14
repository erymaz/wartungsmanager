import { Inject, Injectable } from '@nestjs/common';

import { ConfigService } from '../../config/config.service';
import { JwtUserDto } from '../auth/dto/JwtUserDto';

@Injectable()
export class AuthHelper {
  constructor(@Inject('ConfigService') private configService: ConfigService) {}

  isSuperAdmin(user: JwtUserDto): boolean {
    if (!this.configService.superadmin.enabled) {
      return false;
    }

    return user.username === this.configService.superadmin.username;
  }
}
