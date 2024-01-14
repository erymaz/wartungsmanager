import { DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { AuthHelper } from './auth.helper';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthService } from './jwt-auth.service';
import { Logout } from './logout.entity';

export class JwtAuthModule {
  static forFeature(): DynamicModule {
    return {
      module: JwtAuthModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Logout]),
        JwtModule.registerAsync({
          useFactory: async (config: ConfigService) => {
            return {
              secret: config.jwt.jwtSecret,
              signOptions: { expiresIn: config.jwt.jwtExpiresIn },
            };
          },
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [JwtAuthService, JwtStrategy, AuthHelper],
      exports: [JwtAuthService, JwtModule, AuthHelper],
    };
  }
}
