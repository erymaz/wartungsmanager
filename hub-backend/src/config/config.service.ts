import { LogLevels } from '@elunic/logger';
import { Injectable } from '@nestjs/common';

import { AbstractConfigService } from '../../../shared/backend/src/config/AbstractConfigService';
import { switchEnv } from './switchEnv';

@Injectable()
export class ConfigService extends AbstractConfigService {
  httpPort = Number(process.env.APP_PORT || process.env.APP_PORT_HUB) || 8080;

  externalServiceUrl = String(
    process.env.APP_SERVICE_URL || process.env.APP_SERVICE_URL_USER || '',
  );
  userServiceUrl = String(process.env.APP_SERVICE_URL_USER || '');

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
}
