import { Inject, MiddlewareConsumer, Module, NestModule, OnModuleInit, Type } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dictionary } from 'lodash';
import { createAuthMiddleware } from 'shared/nestjs';

import { JwtAuthModule } from '../auth/jwt/jwt-auth.module';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AclController } from './acl/acl.controller';
import { Acl } from './acl/acl.entity';
import { AclService } from './acl/acl.service';
import { IdPServiceAdapter } from './adapters/abstract-idp-service-adapter';
import { AzureB2cAdapterService } from './adapters/azure-b2c-adapter/azure-b2c-adapter.service';
import { KeycloakAdapterService } from './adapters/keycloak-adapter/keycloak-adapter.service';
import { LocalDevAdapterService } from './adapters/local-dev-adapter/local-dev-adapter.service';
import { Role } from './role/role.entity';
import { RolesController } from './role/roles.controller';
import { RolesService } from './role/roles.service';
import { MeController } from './user/me.controller';
import { User } from './user/user.entity';
import { UserRole } from './user/user-role.entity';
import { UserController } from './user/users.controller';
import { UsersService } from './user/users.service';

const ADAPTER_MAP: Dictionary<Type<IdPServiceAdapter>> = {
  azure: AzureB2cAdapterService,
  keycloak: KeycloakAdapterService,
  local: LocalDevAdapterService,
};

const CONTROLLERS = [UserController, RolesController, AclController, MeController];

@Module({
  imports: [
    ConfigModule,
    JwtAuthModule.forFeature(),
    TypeOrmModule.forFeature([User, Role, Acl, UserRole]),
  ],
  controllers: CONTROLLERS,
  providers: [
    UsersService,
    RolesService,
    AclService,
    {
      provide: IdPServiceAdapter,
      useClass: ADAPTER_MAP[process.env.APP_IDP_ADAPTER as string] || AzureB2cAdapterService,
    },
  ],
  exports: [UsersService, RolesService, AclService, TypeOrmModule, IdPServiceAdapter],
})
export class UsersModule implements OnModuleInit, NestModule {
  constructor(
    @Inject(IdPServiceAdapter) private idpService: IdPServiceAdapter,
    private adapter: HttpAdapterHost,
    private config: ConfigService,
  ) {}
  async onModuleInit() {
    await this.idpService.init();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(createAuthMiddleware(this.adapter, this.config)).forRoutes(...CONTROLLERS);
  }
}
