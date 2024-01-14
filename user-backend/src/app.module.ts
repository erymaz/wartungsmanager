import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandModule } from 'nestjs-command';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AclSeedCommand } from '../seeds/acl/acl-seed.command';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ENTITIES_PATH, MIGRATION_PATH, MIGRATION_TABLE_NAME } from './definitions';
import { UsersModule } from './users/users.module';

export class AppModule {
  static forApp(): DynamicModule {
    return this.buildDynamicModule({
      migrationsRun: true,
    });
  }

  static forE2E(dbName: string): DynamicModule {
    return this.buildDynamicModule({
      dbName,
      migrationsRun: false,
    });
  }

  private static buildDynamicModule({
    migrationsRun,
  }: {
    dbName?: string;
    migrationsRun?: boolean;
  }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule,
        CommandModule,

        LoggerModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            logger: createLogger(config.log.namespace, {
              consoleLevel: config.log.level,
              logPath: config.log.logPath,
            }),
          }),
          inject: [ConfigService],
        }),

        TypeOrmModule.forRootAsync({
          // Don't forget to changes ormconfig.ts as well
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            host: config.database.host,
            ssl: config.database.ssl,
            port: config.database.port,
            username: config.database.user,
            password: config.database.pass,
            database: config.database.name,
            autoLoadEntities: true,
            migrationsTableName: MIGRATION_TABLE_NAME,
            migrations: [MIGRATION_PATH],
            namingStrategy: new SnakeNamingStrategy(),
            migrationsRun,
            entities: [ENTITIES_PATH],
            // to not change!
            synchronize: false,
            keepConnectionAlive: true,
          }),
          inject: [ConfigService],
        }),

        AuthModule,
        UsersModule,
      ],
      providers: [AclSeedCommand],
      controllers: [],
      exports: [ConfigModule, TypeOrmModule],
    };
  }
}
