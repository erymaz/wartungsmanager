import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthInfo } from 'shared/common/types';

import { SharedConfigService } from './shared-config.service';
import { SharedService } from './shared-service';

const urlJoin = require('url-join');

@Injectable()
export class SharedApiService {
  constructor(private readonly sharedConfigService: SharedConfigService) {}

  /**
   * Performs a HTTP GET request to a service as a certain user
   * with optional query parameters.
   *
   * Important: if an error occurs an exception is thrown. The exeption
   * is automatically transformed so that it can always been queried
   * `ex.status` which either contains the HTTP status (>= 200) or is not present
   * in case another error occurred (e.g. connection refused). This differs
   * from the normal axios behaviour in the fact that normal axios errors contain
   * the field `response` which contains the object thrown here.
   *
   * @param authInfo The token store for the user (see `augmentRequestConfigWithUser`)
   * @param service The service to call
   * @param relativeUri The relative URI or endpoint of the service to call
   * @param params Optional query parameters
   * @param options Additional options for axios (used library)
   * @param privileged If the operation should be sent in a priviledged mannor
   * via direct inter-service communication without user rights check
   * @returns The response data directly, meaning that you only need to get the
   * `data` field: `httpGet(...).data` contains the response data
   */
  async httpGetOrFail<T>(
    authInfo: AuthInfo,
    service: SharedService,
    relativeUri: string,
    params?: { [key: string]: string | number | boolean | object },
    options?: AxiosRequestConfig,
    privileged = false,
  ): Promise<AxiosResponse<T>> {
    const url = urlJoin(this.sharedConfigService.getInternalServiceUrlOrFail(service), relativeUri);

    // TODO: implement handling of privileged
    // FIXME: implement handling of privileged

    return this.wrapAxiosError({
      ...this.augmentRequestConfigWithUser(authInfo, options),
      ...(params ? { params } : {}),
      method: 'get',
      url,
    });
  }

  /**
   * Performs a HTTP POST request to a service as a certain user
   * with optional body data.
   *
   * Important: if an error occurs an exception is thrown. The exeption
   * is automatically transformed so that it can always been queried
   * `ex.status` which either contains the HTTP status (>= 200) or is not present
   * in case another error occurred (e.g. connection refused). This differs
   * from the normal axios behaviour in the fact that normal axios errors contain
   * the field `response` which contains the object thrown here.
   *
   * @param authInfo The token store for the user (see `augmentRequestConfigWithUser`)
   * @param service The service to call
   * @param relativeUri The relative URI or endpoint of the service to call
   * @param data The body data to provide to the service
   * @param options Additional options for axios (used library)
   * @param privileged If the operation should be sent in a priviledged mannor
   * via direct inter-service communication without user rights check
   * @returns The response data directly, meaning that you only need to get the
   * `data` field: `httpGet(...).data` contains the response data
   */
  async httpPostOrFail<T>(
    authInfo: AuthInfo,
    service: SharedService,
    relativeUri: string,
    data?: { [key: string]: string | number | boolean | object },
    options?: AxiosRequestConfig,
    privileged = false,
  ): Promise<AxiosResponse<T>> {
    // TODO: implement handling of privileged
    // FIXME: implement handling of privileged

    const url = urlJoin(this.sharedConfigService.getInternalServiceUrlOrFail(service), relativeUri);

    return this.wrapAxiosError({
      ...this.augmentRequestConfigWithUser(authInfo, options),
      ...(data ? { data } : {}),
      method: 'get',
      url,
    });
  }

  // ---

  /**
   * "Strips" the `response` object out from the axios exception, so that
   * the user does not need to do `ex.response.status` but only `ex.status`
   * since on success it is also `resp.status` so both branches can be
   * handled the same if required
   *
   * @param config The axios config to request
   * @returns The data or throws an error
   */
  private async wrapAxiosError<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      // If everything works out, we can return the response
      const result = await axios(config);
      return result as AxiosResponse<T>;
    } catch (ex) {
      // Otherwise, we check if the error is an axios error and
      // return only the part under `response`, which contains the
      // status
      if (ex.isAxiosError) {
        throw ex.response;
      } else {
        // But a normal error can also be thrown like for connection
        // refused
        throw ex;
      }
    }
  }

  /**
   * Augments a axios request config with the auth information of the user
   * extracted from the user token
   *
   * @param authInfo The user token or session object
   * @param cfg The existing config to extend
   * @returns The fully augmented config
   */
  private augmentRequestConfigWithUser(
    authInfo: AuthInfo,
    cfg?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    let axiosCfg: AxiosRequestConfig = {};

    if (cfg) {
      axiosCfg = cfg;
    }

    if (!axiosCfg.headers) {
      axiosCfg.headers = {};
    }

    // Augment the config with internal request
    axiosCfg.headers['Authorization'] = `Bearer ${authInfo.token}`;
    axiosCfg.headers['X-Internal-API-Request'] = `1`;

    return axiosCfg;
  }
}
