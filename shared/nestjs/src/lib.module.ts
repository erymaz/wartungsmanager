import { Module } from '@nestjs/common';
import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common/interfaces';
import { AbstractConfigService } from 'shared/backend/config';

import { SharedApiService } from './services/shared-api.service';
import { SharedConfigService } from './services/shared-config.service';
import { SharedFileService } from './services/shared-file.service';

@Module({})
export class LibModule {
  static forRootAsync(options: LibModuleAsyncOptions): DynamicModule {
    // The caching ensures we don't call the useFactory() function in the options more than necessary
    let cachedModuleOptions: LibModuleOptions;
    async function useFactoryCached(...args: unknown[]): Promise<LibModuleOptions> {
      if (!cachedModuleOptions) {
        cachedModuleOptions = await options.useFactory(...args);
      }

      return cachedModuleOptions;
    }

    const providers: Provider[] = [
      {
        provide: AbstractConfigService,
        useFactory: async (...args: unknown[]): Promise<AbstractConfigService> =>
          (await useFactoryCached(...args)).configService,
        inject: options.inject || [],
      },
      SharedFileService,
      SharedConfigService,
      SharedApiService,
    ];

    return {
      module: LibModule,
      global: true,
      imports: options.imports,
      providers,
      exports: providers,
    };
  }
}

interface LibModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<LibModuleOptions> | LibModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
}

export interface LibModuleOptions {
  configService: AbstractConfigService;
}
