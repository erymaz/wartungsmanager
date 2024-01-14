import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'shared/nestjs';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AssetsModule } from './assets/assets.module';
import { CommentModule } from './comment/comment.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ENTITIES_PATH, MIGRATION_PATH, MIGRATION_TABLE_NAME } from './definitions';
import { DocumentModule } from './document/document.module';
import { FileModule } from './file/file.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule,
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
        migrationsRun: true,
        entities: [ENTITIES_PATH],
        // to not change!
        synchronize: false,
        keepConnectionAlive: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([]),
    ScheduleModule.forRoot(),
    AssetsModule,
    MaintenanceModule,
    TaskModule,
    CommentModule,
    FileModule,
    DocumentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ]
})
export class AppModule {}
