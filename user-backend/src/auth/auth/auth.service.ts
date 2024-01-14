import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '../../config/config.service';
import { asResponse, DataResponse } from '../../lib/data-response';
import { User } from '../../users/user/user.entity';
import { UsersService } from '../../users/user/users.service';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { LoginRequestDto, TokenDto } from './dto/LoginDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtAuthService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async login(payload: LoginRequestDto): Promise<DataResponse<TokenDto>> {
    if (
      this.configService.superadmin.enabled &&
      payload.username === this.configService.superadmin.username &&
      payload.password === this.configService.superadmin.password
    ) {
      const jwt = {
        email: this.configService.superadmin.username,
        username: this.configService.superadmin.username,
        sub: 'SUPER_ADMIN',
      };

      return asResponse({ token: await this.jwtService.sign(jwt) });
    }

    const user = await this.usersService.findOne({
      where: { name: payload.username },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Please, provide correct credentials!');
    }

    if (!(await user.verifyPassword(payload.password))) {
      throw new NotFoundException('Please, provide correct credentials!');
    }

    const jwtData = { email: user.email, username: user.name, sub: user.id };

    return asResponse({ token: await this.jwtService.sign(jwtData) });
  }

  async logout(userId: string): Promise<DataResponse<boolean>> {
    return this.jwtService.logout(userId);
  }
}
