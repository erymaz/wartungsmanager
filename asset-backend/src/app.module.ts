import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoiPipeModule } from 'nestjs-joi';
import { LibModule } from 'shared/nestjs/lib.module';
import { RolesGuard } from 'shared/nestjs';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ActivityLogController } from './activity-log/activity-log.controller';
import { ActivityLogEntity } from './activity-log/activity-log.entity';
import { ActivityLogService } from './activity-log/activity-log.service';
import { AssetAliasActivityCreator } from './activity-log/AssetAliasActivityCreator';
import { AssetDocumentActivityCreator } from './activity-log/AssetDocumentActivityCreator';
import { AgentService } from './agent/agent.service';
import { AssetController } from './asset/asset.controller';
import { AssetEntity } from './asset/asset.entity';
import { AssetService } from './asset/asset.service';
import { AssetAliasEntity } from './asset/asset-alias.entity';
import { AssetHierarchyController } from './asset-hierarchy/asset-hierarchy.controller';
import { AssetHierarchyEntity } from './asset-hierarchy/asset-hierarchy.entity';
import { AssetHierarchyService } from './asset-hierarchy/asset-hierarchy.service';
import { AssetPropertyController } from './asset-property/asset-property.controller';
import { AssetPropertyService } from './asset-property/asset-property.service';
import { AssetPropertyDefinitionEntity } from './asset-property/asset-property-definition.entity';
import { AssetPropertyValueEntity } from './asset-property/asset-property-value.entity';
import { AssetTypeController } from './asset-type/asset-type.controller';
import { AssetTypeEntity } from './asset-type/asset-type.entity';
import { AssetTypeService } from './asset-type/asset-type.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ENTITIES_PATHS, MIGRATION_PATH, MIGRATION_TABLE_NAME } from './definitions';

@Module({
  controllers: [
    AssetController,
    AssetHierarchyController,
    AssetPropertyController,
    AssetTypeController,
    ActivityLogController,
  ],
  providers: [
    AssetService,
    AssetHierarchyService,
    AssetPropertyService,
    AssetTypeService,
    ActivityLogService,
    AgentService,
  ],
})
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
    dbName,
    migrationsRun,
  }: {
    dbName?: string;
    migrationsRun?: boolean;
  }): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
      ],
      controllers: [],
      exports: [],
      imports: [
        LibModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
        }),
        ConfigModule,
        JoiPipeModule,

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
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            host: config.database.host,
            ssl: config.database.ssl,
            port: config.database.port,
            username: config.database.user,
            password: config.database.pass,
            database: dbName ? dbName : config.database.name,
            autoLoadEntities: true,
            entities: [...ENTITIES_PATHS],
            migrationsTableName: MIGRATION_TABLE_NAME,
            migrations: [MIGRATION_PATH],
            namingStrategy: new SnakeNamingStrategy(),
            migrationsRun,
            subscribers: [AssetDocumentActivityCreator, AssetAliasActivityCreator],
            // debug: true,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([
          AssetEntity,
          AssetHierarchyEntity,
          ActivityLogEntity,
          AssetAliasEntity,
          AssetTypeEntity,
          AssetPropertyDefinitionEntity,
          AssetPropertyValueEntity,
        ]),
        ScheduleModule.forRoot(),
      ],
    };
  }
}
