import { createLogger, LogService, RootLogger } from '@elunic/logger';
import { LOGGER, LoggerModule } from '@elunic/logger-nestjs';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs-extra';
import { JoiPipeModule } from 'nestjs-joi';
import { HttpExceptionFilter, RolesGuard } from 'shared/nestjs';
import { LibModule } from 'shared/nestjs/lib.module';

import { AbstractFileServiceAdapter } from './adapter/AbstractFileServiceAdapter';
import { AzureAdapterService } from './adapter/azure-adapter.service';
import { FsAdapterService } from './adapter/fs-adapter.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ControllerUtilsService } from './file/controller-utils.service';
import { FetchFileController } from './file/fetch-file.controller';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { UploadFileController } from './file/upload-file.controller';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DynamicModuleOptions {}

@Module({})
export class AppModule {
  static forApp(): DynamicModule {
    return this.buildDynamicModule({});
  }

  static forE2E(): DynamicModule {
    return this.buildDynamicModule({});
  }

  // eslint-disable-next-line no-empty-pattern
  private static buildDynamicModule({}: DynamicModuleOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule,
        JoiPipeModule,
        LoggerModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            logger: createLogger(config.log.namespace, {
              consoleLevel: config.log.consoleLevel,
              json: config.log.json,
            }),
          }),
          inject: [ConfigService],
        }),

        MulterModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService, rootLogger: RootLogger) => {
            rootLogger
              .createLogger('multerConfig')
              .info(`Uploading into: ${configService.uploadTempPath}`);

            await fs.ensureDir(configService.uploadTempPath).catch(err => {
              throw new Error(
                `Failed to ensure existence of upload temp folder ${configService.uploadTempPath}: ${err.message}`,
              );
            });
            await fs.access(configService.uploadTempPath, fs.constants.W_OK).catch(err => {
              throw new Error(
                `Upload temp folder is not writable (${configService.uploadTempPath}): ${err.message}`,
              );
            });

            return {
              dest: configService.uploadTempPath,
              limits: {
                fileSize: configService.maxUploadFileSize,
              },
            };
          },
          inject: [ConfigService, LOGGER],
        }),

        LibModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
        }),
      ],
      controllers: [FileController, FetchFileController, UploadFileController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
        {
          provide: AbstractFileServiceAdapter,
          useFactory: (config: ConfigService, logger: RootLogger): AbstractFileServiceAdapter => {
            switch (config.storageAdapter) {
              case 'fs':
                logger.info(`Using filesystem as backend`);
                return new FsAdapterService(
                  config,
                  new LogService(logger.createLogger(FsAdapterService.name)),
                );

              case 'azblob':
                logger.info(`Using Azure file store backend`);
                return new AzureAdapterService(
                  config,
                  new LogService(logger.createLogger(AzureAdapterService.name)),
                );

              default:
                throw new Error(
                  `Unknown FileServiceAdapterImplementation: "${config.storageAdapter}"`,
                );
            }
          },
          inject: [ConfigService, LOGGER],
        },
        FileService,
        ControllerUtilsService,
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
    };
  }
}
