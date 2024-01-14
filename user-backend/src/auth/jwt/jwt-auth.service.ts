import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '../../config/config.service';
import { asResponse, DataResponse } from '../../lib/data-response';
import { Logout } from './logout.entity';

import moment = require('moment');
import { AuthInfo } from 'shared/common/types';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Logout)
    private readonly logoutRepository: Repository<Logout>,
  ) {}

  async sign(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      algorithm: this.configService.jwt.jwtInternalAlgorithm,
    });
  }

  async decode(token: string): Promise<AuthInfo> {
    const decode = this.jwtService.decode(token, { complete: true, json: true }) as any;
    if (decode?.payload) return decode.payload;
    return decode;
  }

  async logout(userId: string): Promise<DataResponse<boolean>> {
    const [partialEntity] = await this.logoutRepository.find({
      where: { userId },
      select: ['id', 'date'],
    });

    if (partialEntity) {
      await this.logoutRepository.update(partialEntity.id, { date: new Date().toISOString() });
    } else {
      await this.logoutRepository.insert({ userId });
    }

    return asResponse(true);
  }

  async checkLogoutTime(userId: string, tokenIssueAt: number): Promise<boolean> {
    const [partialEntity] = await this.logoutRepository.find({
      where: {
        userId,
      },
      select: ['id', 'date'],
    });

    if (!partialEntity) {
      return true;
    }

    const isInvalid = moment(partialEntity.date).isAfter(
      moment.unix(tokenIssueAt).utc(false).toDate(),
    );

    return !isInvalid;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, {
        algorithms: [this.configService.jwt.jwtInternalAlgorithm],
        ignoreExpiration: false,
        secret: this.configService.jwt.jwtSecret,
      });

      return true;
    } catch (_) {
      return false;
    }
  }

  async verifyInternalToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, {
        publicKey: this.configService.getJwtInternalPublic(),
        algorithms: [this.configService.jwt.jwtInternalAlgorithm],
        ignoreExpiration: false,
        secret: this.configService.getJwtInternalSecret(),
      });

      return true;
    } catch (_) {
      return false;
    }
  }
}
