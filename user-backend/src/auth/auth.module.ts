import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtAuthModule } from './jwt/jwt-auth.module';

@Module({
  imports: [UsersModule, ConfigModule, JwtAuthModule.forFeature()],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
