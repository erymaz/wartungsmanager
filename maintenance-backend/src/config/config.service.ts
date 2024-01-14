import { Injectable } from '@nestjs/common';
import * as jsonwebtoken from 'jsonwebtoken';
import { AxiosRequestConfig } from 'axios';
import { LogLevels } from '@elunic/logger';
import { AuthInfo } from 'shared/common/types';
import { AbstractConfigService } from 'shared/backend';

import { switchEnv } from './switchEnv';

@Injectable()
export class ConfigService extends AbstractConfigService {
  httpPort = Number(process.env.APP_PORT) || Number(process.env.APP_PORT_MAINTENANCE) || 8084;

  database = switchEnv(
    {
      testing: {
        host: process.env.APP_TEST_DB_HOST || '',
        port: Number(process.env.APP_TEST_DB_PORT) || 3306,
        user: process.env.APP_TEST_DB_USER || '',
        pass: process.env.APP_TEST_DB_PASS || '',
        name: process.env.APP_TEST_DB_NAME || '',
        ssl: false,
      },
      e2e: {
        host: process.env.APP_TEST_DB_HOST || '',
        port: Number(process.env.APP_TEST_DB_PORT) || 3306,
        user: process.env.APP_TEST_DB_USER || '',
        pass: process.env.APP_TEST_DB_PASS || '',
        name: process.env.APP_TEST_DB_NAME || '',
        ssl: false,
      },
    },
    {
      host: process.env.APP_DB_HOST || '',
      port: Number(process.env.APP_DB_PORT) || 3306,
      user: process.env.APP_DB_USER || '',
      pass: process.env.APP_DB_PASS || '',
      name: process.env.APP_DB_NAME || '',
      ssl: [1, '1', true, 'true'].includes(process.env.APP_DB_SSL || ''),
    },
  );

  log = {
    level: (process.env.LOG_LEVEL || 'info') as LogLevels,
    namespace: 'app',
    logPath: process.env.APP_LOG_PATH || undefined,
  };

  get assetServiceUrl(): string {
    return process.env.APP_SERVICE_URL_ASSET || '';
  }

  private getInternalJwtSecret(): string {
    return process.env.AUTH_INTERNAL_JWT_SECRET || 'c7c643934ebacb969a487eff83e5ab2db42edfab';
  }

  getRequestHeader(auth: AuthInfo): AxiosRequestConfig {
    const token = jsonwebtoken.sign(auth, this.getInternalJwtSecret());
    return {
      headers: {
        'X-Internal-Authorization': `Bearer ${token}`,
      },
    };
  }
}
