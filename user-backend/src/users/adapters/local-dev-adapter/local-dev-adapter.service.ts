import 'isomorphic-fetch';

import { promises as fs } from 'fs';
import { IncomingMessage } from 'http';
import { InternalServerError } from 'http-errors';
import { join } from 'path';
import { AuthRoles } from 'shared/common/types';
import { v4 as uuid } from 'uuid';

import {
  IdPServiceAdapter,
  OpenIdSignInResponseModes,
  SignInClaims,
} from '../abstract-idp-service-adapter';
import { ApiToken } from '../dto/ApiToken';
import { UserAdapterObject } from '../dto/UserAdapterObject';

interface DatabaseFileContents {
  lastWrittenAt: string;
  users: UserAdapterObject[];
  tokens: Array<
    ApiToken & {
      clientSecret: string;
      clientId: string;
    }
  >;
}

const INITIAL_DATA: DatabaseFileContents = {
  lastWrittenAt: '2020-08-25T09:40:15.813Z',
  users: [
    {
      userName: 'stephen_hawking',
      firstName: 'Stephen',
      lastName: 'Hawking',
      roles: [AuthRoles.SCHULER_ADMIN],
      email: 'stephen.hawking@elunic.com',
      displayName: 'Stephen Hawking',
      preferredLanguage: 'en_US',
      tenantId: 'local_tenant',
      id: '5dae2c5c-d9d6-4696-bf71-3b6b90a3a100',
      identities: [],
    },
    {
      userName: 'albert_einstein',
      firstName: 'Albert',
      lastName: 'Einstein',
      roles: [AuthRoles.SCHULER_ADMIN],
      email: 'albert_einstein@elunic.com',
      displayName: 'Albert Einstein',
      preferredLanguage: 'de',
      tenantId: 'local_tenant',
      id: '4ec3898d-06ef-409a-af31-c788e4bbb574',
      identities: [],
    },
  ],
  tokens: [
    {
      id: '6d739561-31e1-4591-990c-ccde096aa9a3',
      appId: '3e6984f9-51ec-4e7a-9523-a7ce7ff4e2eb',
      name: 'Token 1',
      createdAt: '2020-08-25T09:40:36.177Z',
      expiresAt: '2020-08-25T09:40:36.177Z',
      tenantId: 'local_tenant',
      secret: 'dko',
      scopes: [],
      clientSecret: '0.mo7a3c7r68',
      clientId: '3e6984f9-51ec-4e7a-9523-a7ce7ff4e2eb',
    },
    {
      id: '33b208b5-ab6b-4e7a-ac72-217f8e6997ae',
      appId: '973cb7f8-cc00-4d06-bcd3-fcd030f5780b',
      name: 'Token 2',
      createdAt: '2020-08-25T09:44:51.956Z',
      expiresAt: '2020-08-25T09:44:51.956Z',
      tenantId: 'local_tenant',
      secret: 'jqk',
      scopes: [],
      clientSecret: '0.1k45l3v774o',
      clientId: '973cb7f8-cc00-4d06-bcd3-fcd030f5780b',
    },
  ],
};

export class LocalDevAdapterService implements IdPServiceAdapter {
  private storageFilePath: string;

  constructor() {
    this.storageFilePath = join(__dirname, '..', '..', '..', 'fake-aad-b2c-store.json');
  }

  async init() {
    console.warn(`# #############################################`);
    console.warn(`# IMPORTANT:`);
    console.warn(`# You are currently using the LocalDevAdapterService AAD B2C adapter`);
    console.warn(`# service, which contains only some artifical users and is not`);
    console.warn(`# connected to AAD B2C for easy local development. If you whish to`);
    console.warn(`# connect to the "real" AAD B2C make sure that you either set the`);
    console.warn(`# `);
    console.warn(`#   env NODE_ENV == 'production'`);
    console.warn(`# `);
    console.warn(`# or set`);
    console.warn(`# `);
    console.warn(`#   FORCE_USE_B2C="1"`);
    console.warn(`# `);
    console.warn(`# in your local .env file`);
    console.warn(`# #############################################`);
    console.info(`Fake AAD B2C successfully initialized`);
    console.info(`Storing tmp data to: ${this.storageFilePath}`);
    console.info(` `);
    console.info(`Tip: If you want to start from a clean env, just remove this file and`);
    console.info(`restart the service`);
    console.info(` `);
  }

  private async getData(): Promise<DatabaseFileContents> {
    try {
      const cont = await fs.readFile(this.storageFilePath);
      return JSON.parse(cont.toString()) as DatabaseFileContents;
    } catch (ex) {
      console.debug(`Cannot read tmp data file (might be normal): ${ex}`);

      try {
        await this.setData(INITIAL_DATA);
        return INITIAL_DATA;
      } catch (ex) {
        console.debug(`Cannot create dummy data: ${ex}`);
      }

      return {
        lastWrittenAt: new Date().toISOString(),
        users: [],
        tokens: [],
      };
    }
  }

  private async setData(data: DatabaseFileContents): Promise<void> {
    try {
      fs.writeFile(
        this.storageFilePath,
        JSON.stringify(
          {
            ...data,
            lastWrittenAt: new Date().toISOString(),
          },
          null,
          4,
        ),
      );
    } catch (ex) {
      console.error(`Cannot write tmp data file: ${ex}`);
      console.error(`The app might behave strange since the data could not be written!`);
    }
  }

  async getOpenIdSigninRedirectUrl(
    responseMode: OpenIdSignInResponseModes = 'form_post',
    scopes: string[] | null = null,
  ): Promise<{ url: string; responseMode: string; scopes: string[] }> {
    throw new InternalServerError(`Not implemented for local-dev-adapter`);
  }

  async getOpenIdSignOutRedirectUrl(relayState?: string | null): Promise<string> {
    throw new InternalServerError(`Not implemented for local-dev-adapter`);
  }

  async verifyOpenIdSigninAndGetClaims(req: IncomingMessage): Promise<SignInClaims> {
    throw new InternalServerError(`Not implemented for local-dev-adapter`);
  }

  async createUser(
    user: Partial<UserAdapterObject>,
    tenantId: string,
    newPassword?: string,
  ): Promise<UserAdapterObject> {
    console.debug(`createUser(..., ${tenantId})`, user);
    const db = await this.getData();
    const newUser = {
      ...user,
      tenantId,
      id: uuid(),
    } as UserAdapterObject;
    db.users.push(newUser);
    await this.setData(db);
    return newUser;
  }

  async getUsersForTenant(tenantId: string): Promise<UserAdapterObject[]> {
    const db = await this.getData();
    return db.users.filter(u => u.tenantId === tenantId);
  }

  async getSimpleUsersBulkForTenantById(
    userIds: string[],
    tenantId: string,
  ): Promise<UserAdapterObject[]> {
    const db = await this.getData();
    return db.users.filter(u => u.tenantId === tenantId && userIds.includes(u.id));
  }

  async getUserByIdForTenant(id: string, tenantId: string): Promise<UserAdapterObject | null> {
    const db = await this.getData();
    return db.users.find(u => u.tenantId === tenantId && u.id === id) || null;
  }

  async getUserById(id: string): Promise<UserAdapterObject | null> {
    const db = await this.getData();
    return db.users.find(u => u.id === id) || null;
  }

  async getUserByUserName(username: string, tenantId: string): Promise<UserAdapterObject | null> {
    const db = await this.getData();
    return db.users.find(u => u.tenantId === tenantId && u.userName === username) || null;
  }

  async deleteUserByIdForTenant(id: string, tenantId: string): Promise<boolean> {
    console.debug(`deleteUserByIdForTenant(${id}, ${tenantId})`);

    const db = await this.getData();
    db.users = db.users.filter(u => !(u.tenantId === tenantId && u.id === id));
    await this.setData(db);
    return true;
  }

  async isUserNameGloballyAvailable(userName: string): Promise<boolean> {
    const db = await this.getData();
    const results = db.users.filter(u => u.userName === userName);
    return results.length < 1;
  }

  async updateUserByIdForTenant(
    id: string,
    tenantId: string,
    data: Partial<UserAdapterObject>,
  ): Promise<UserAdapterObject | null> {
    const db = await this.getData();
    const userIdx = db.users.findIndex(u => u.tenantId === tenantId && u.id === id);
    if (userIdx > -1) {
      db.users[userIdx] = {
        ...db.users[userIdx],
        ...data,
        id: db.users[userIdx].id,
      } as UserAdapterObject;
      await this.setData(db);
      return db.users[userIdx];
    } else {
      return null;
    }
  }

  async updatePasswordForUser(id: string, tenantId: string, newPassword: string): Promise<boolean> {
    const db = await this.getData();
    const userIdx = db.users.findIndex(u => u.tenantId === tenantId && u.id === id);
    if (userIdx > -1) {
      db.users[userIdx] = {
        ...db.users[userIdx],
        password: newPassword,
      } as UserAdapterObject;
      await this.setData(db);
    }
    return userIdx > -1;
  }

  async getApiTokenForClientSecret(clientId: string, clientSecret: string): Promise<ApiToken> {
    const db = await this.getData();
    const token = db.tokens.find(t => t.clientId === clientId && t.clientSecret === clientSecret);

    if (!token) {
      throw new Error('No token found');
    }

    return token;
  }

  async getAllApiTokens(tenantId: string): Promise<ApiToken[]> {
    const db = await this.getData();
    return db.tokens.filter(t => t.tenantId === tenantId);
  }

  async getSimpleApiTokenBulkForTenantId(ids: string[], tenantId: string): Promise<ApiToken[]> {
    const db = await this.getData();
    return db.tokens.filter(t => t.tenantId === tenantId && ids.includes(t.id));
  }

  async validatePasswordByUserName(username: string, password: string): Promise<boolean> {
    console.info(`validatePasswordByUserName(${username}, ...) is always true on local dev!`);
    return true;
  }

  async createNewApiToken(tenantId: string, name: string, scopes: string[]): Promise<ApiToken> {
    const clientId = uuid();

    const apiToken: ApiToken & {
      clientSecret: string;
      clientId: string;
    } = {
      id: uuid(),
      appId: clientId,
      name,
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      tenantId,
      secret: Math.random().toString(32).substring(3, 6),
      scopes,
      clientSecret: Math.random().toString(32),
      clientId,
    };

    const db = await this.getData();
    db.tokens.push(apiToken);
    await this.setData(db);

    return apiToken as ApiToken;
  }

  async deleteApiToken(tenantId: string, tokenId: string): Promise<boolean> {
    const db = await this.getData();
    db.tokens = db.tokens.filter(t => !(t.tenantId === tenantId && t.id === tokenId));
    await this.setData(db);
    return true;
  }
}
