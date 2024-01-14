import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import axios from 'axios';
import * as Joi from 'joi';
import * as qs from 'qs';

import { ConfigService } from '../../../config/config.service';

interface BareMsAPIAuthorizationResponse {
  token_type: string; // Bearer
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
}

interface AuthorizationResponse extends BareMsAPIAuthorizationResponse {
  scope: string;
  grantType: string;
  iat: number;
}

export class MsGraphApiAuthenticationProvider implements AuthenticationProvider {
  constructor(private configService: ConfigService) {
    // super();
  }

  /**
   * This method will get called before every request to the msgraph server
   * This should return a Promise that resolves to an accessToken (in case of success) or rejects with error (in case of failure)
   * Basically this method will contain the implementation for getting and refreshing accessTokens
   */
  async getAccessToken(): Promise<string> {
    const x = await this.getBearerToken();

    return x;
  }

  private _cachedToken: AuthorizationResponse | null = null;

  // constructor(private readonly configService: ConfigService) {}

  async getBearerToken(
    grantType = 'client_credentials',
    scope = 'https://graph.microsoft.com/.default',
  ): Promise<string> {
    // Check if the token is cached
    if (
      this._cachedToken &&
      this._cachedToken.grantType === grantType &&
      this._cachedToken.scope === scope
    ) {
      console.log(`Use cached token!`);
      if (this._cachedToken.iat + this._cachedToken.expires_in > Date.now() / 1000) {
        console.log(`Fine, responding with it!`);
        return this._cachedToken.access_token;
      } else {
        console.log(
          `Token is expired: iat=${this._cachedToken.iat}, expiresIn=${this._cachedToken.expires_in}`,
        );
      }
    }

    // Generate a new token
    console.log(`Generate a new access token!`);
    const token = await this.requestToken(grantType, scope);

    this._cachedToken = {
      ...token,
      iat: Math.round(Date.now() / 1000),
      scope,
      grantType,
    };

    return this._cachedToken.access_token;
  }

  // ---

  private async requestToken(
    grantType: string,
    scope: string,
  ): Promise<BareMsAPIAuthorizationResponse> {
    let dataResponse: BareMsAPIAuthorizationResponse | null = null;
    try {
      console.log(
        `Sending request to: https://login.microsoftonline.com/${this.configService.azure.graphApiAuthorityId}/oauth2/v2.0/token`,
      );

      // Request an auth token
      const reqResult = await axios.post(
        `https://login.microsoftonline.com/${this.configService.azure.graphApiAuthorityId}/oauth2/v2.0/token`,
        qs.stringify({
          client_id: this.configService.azure.graphApiClientId,
          scope,
          client_secret: this.configService.azure.graphApiSecret,
          grant_type: grantType,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // console.log(11, dataResponse);

      dataResponse = reqResult.data as BareMsAPIAuthorizationResponse;
    } catch (ex) {
      console.error('Failed to request MS Graph token:', ex);
      throw new Error('Failed to access MS Graph Auth API!');
    }

    if (typeof dataResponse !== 'object') {
      console.error(`Response is not an object: ${typeof dataResponse}`);
      console.error(dataResponse);
      throw new Error('MS Graph Auth API reponse is not an object!');
    }

    if (!dataResponse) {
      console.error(`Response is empty:`);
      console.error(dataResponse);
      throw new Error('MS Graph Auth API reponse is empty!');
    }

    // Validate against schema
    const validateResult = Joi.object()
      .keys({
        token_type: Joi.string().min(1),
        expires_in: Joi.number().min(1),
        ext_expires_in: Joi.number().min(1),
        access_token: Joi.string().min(64).max(8192),
      })
      .validate(dataResponse, { allowUnknown: false });

    if (validateResult.error) {
      console.error(`Response is malformed:`);
      console.error(validateResult.error);
      throw new Error('MS Graph Auth API reponse is malformed!');
    }

    if (dataResponse.token_type !== 'Bearer') {
      console.error(`Response has invalid token type:`);
      console.error(validateResult);
      throw new Error('MS Graph Auth API reponse invalid token type!');
    }

    return dataResponse as BareMsAPIAuthorizationResponse;
  }
}
