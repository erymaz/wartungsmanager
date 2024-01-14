import { IncomingMessage } from 'http';

import { ApiToken } from './dto/ApiToken';
import { UserAdapterObject } from './dto/UserAdapterObject';

export type OpenIdSignInResponseModes = 'query' | 'fragment' | 'form_post';
export interface SignInClaims {
  [key: string]: string | number | boolean | SignInClaims;
}

export abstract class IdPServiceAdapter {
  /**
   * Initializes the service and performs all necessary steps.
   * If this function throws an exception the entire service cannot
   * be started.
   */
  abstract async init(): Promise<void>;

  /**
   * Creates a new user for the given parameters. Throws an exception if
   * the creation fails or returns the created user element
   *
   * @param user The user object to create.
   * @param tenantId The tenant id field for the user to create.
   * @param tenantId The tenant id field for the user to create.
   */
  abstract async createUser(
    user: Partial<UserAdapterObject>,
    tenantId: string,
    newPassword?: string,
  ): Promise<UserAdapterObject>;

  /**
   * Fetches all users for a given tenant id. Returns _always_ an (empty)
   * array.
   *
   * @param tenantId The tenant id to identify the tenant to find
   * all users for.
   */
  abstract async getUsersForTenant(tenantId: string): Promise<UserAdapterObject[]>;

  abstract async getSimpleUsersBulkForTenantById(
    userIds: string[],
    tenantId: string,
  ): Promise<UserAdapterObject[]>;

  abstract async getUserById(id: string): Promise<UserAdapterObject | null>;

  abstract async getUserByIdForTenant(
    id: string,
    tenantId: string,
  ): Promise<UserAdapterObject | null>;

  abstract async deleteUserByIdForTenant(id: string, tenantId: string): Promise<boolean>;

  abstract async isUserNameGloballyAvailable(userName: string): Promise<boolean>;

  abstract async updateUserByIdForTenant(
    id: string,
    tenantId: string,
    data: Partial<UserAdapterObject>,
  ): Promise<UserAdapterObject | null>;

  abstract async updatePasswordForUser(
    id: string,
    tenantId: string,
    newPassword: string,
  ): Promise<boolean>;

  abstract async getUserByUserName(
    username: string,
    tenantId: string,
  ): Promise<UserAdapterObject | null>;

  abstract async validatePasswordByUserName(username: string, password: string): Promise<boolean>;

  // / ----

  abstract async getApiTokenForClientSecret(
    clientId: string,
    clientSecret: string,
  ): Promise<ApiToken>;

  abstract async getAllApiTokens(tenantId: string): Promise<ApiToken[]>;

  abstract async createNewApiToken(
    tenantId: string,
    name: string,
    scopes: string[],
  ): Promise<ApiToken>;

  abstract async deleteApiToken(tenantId: string, tokenId: string): Promise<boolean>;

  abstract async getSimpleApiTokenBulkForTenantId(
    ids: string[],
    tenantId: string,
  ): Promise<ApiToken[]>;

  // / -----

  abstract async getOpenIdSigninRedirectUrl(
    responseMode?: OpenIdSignInResponseModes,
    scopes?: string[] | null,
  ): Promise<{ url: string; responseMode: string; scopes: string[] }>;

  abstract async getOpenIdSignOutRedirectUrl(relayState?: string | null): Promise<string>;

  abstract async verifyOpenIdSigninAndGetClaims(req: IncomingMessage): Promise<SignInClaims>;
}
