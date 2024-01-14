import { Injectable } from '@nestjs/common';
import { get, has } from 'lodash';
import { AbstractConfigService } from 'shared/backend';

import { SharedService } from './shared-service';

@Injectable()
export class SharedConfigService {
  constructor(private readonly configService: AbstractConfigService) {}

  /**
   * Returns the configured internal URL of the interned service from
   * the environment variables (AbstractConfigService implemented by
   * every service). Throws an error if the name could not be found
   *
   * @param service The service for which the URL should be searched
   * @returns The (internal) URL to the service
   */
  getInternalServiceUrlOrFail(service: SharedService) {
    const serviceVariableName = (service ?? '').toString();

    if (
      has(this.configService, serviceVariableName) &&
      typeof get(this.configService, serviceVariableName) === 'string'
    ) {
      const serviceName = (get(this.configService, serviceVariableName) || '').trim();

      if (!serviceName) {
        throw new Error(`Path to service for ${service} is empty (illegal configuration)`);
      }

      return serviceName;
    }

    throw new Error(`Unknown path to service: ${service} (not configured)`);
  }
}
