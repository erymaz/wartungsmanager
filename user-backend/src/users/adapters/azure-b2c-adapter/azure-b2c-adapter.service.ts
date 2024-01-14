// import * as iso639Util from '../../helpers/iso639Util';
// import { SCOPE_SUPER_ADMIN_PERMS } from 'df-lib/models/AuthInfo';
import 'isomorphic-fetch';

import { Client } from '@microsoft/microsoft-graph-client';
import { Injectable } from '@nestjs/common';
// import {
//     BadRequestException,
//     ConflictException,
//     ForbiddenException,
//     Global,
//     Injectable,
//     InternalServerErrorException,
//     NotFoundException,
//     Scope,
// } from '@nestjs/common';
import { ArgumentError, NotFoundError } from 'common-errors';
import { IncomingMessage } from 'http';
import { decode } from 'jsonwebtoken';
import { identity, omit, pickBy } from 'lodash';
import { Client as OpenIdClient, custom, Issuer, IssuerMetadata } from 'openid-client';
import { URL } from 'url';
import { v4 as uuidV4 } from 'uuid';

import { ConfigService } from '../../../config/config.service';
import {
  IdPServiceAdapter,
  OpenIdSignInResponseModes,
  SignInClaims,
} from '../abstract-idp-service-adapter';
import { ApiToken } from '../dto/ApiToken';
import { UserAdapterIdentityObject, UserAdapterObject } from '../dto/UserAdapterObject';
import { GraphApiFilterQueryBuilder } from './graph-api-filter-query-builder';
import { MsGraphApiAuthenticationProvider } from './ms-graph-auth-provider';

const TENANT_ID_FIELD = 'TenantId';
// const SUPERADMIN_FIELD = "SuperAdmin"
const SCOPE_SUPER_ADMIN_PERMS = `api://super-admin-premissions`;

const DEFAULT_FIELDS = [
  'businessPhones',
  'displayName',
  'givenName',
  'jobTitle',
  'mail',
  'mobilePhone',
  'officeLocation',
  'preferredLanguage',
  'surname',
  'userPrincipalName',
  'id',
  'identities',
];

interface GraphApiUserResponse {
  [key: string]: string | number | boolean | null | undefined | GraphApiUserResponse;
}

@Injectable()
export class AzureB2cAdapterService implements IdPServiceAdapter {
  private b2cExtensionsAppId!: {
    appId: string;
    appIdTransformed: string;
  };

  private client!: Client;

  private openIdClient!: OpenIdClient;
  private metadata!: IssuerMetadata;

  constructor(private configService: ConfigService) {}

  async init() {
    console.log(`Initializing Azure AD B2C adapter...`);
    console.log(` --> Graph API Client Id = ${this.configService.azure.graphApiClientId}`);
    console.log(` --> AD B2C tenant name = ${this.configService.azure.tenantName}`);

    const options = {
      authProvider: new MsGraphApiAuthenticationProvider(this.configService),
    };
    this.client = Client.initWithMiddleware(options);

    await this.loadExtensionAzureADB2CAppId();
    await this.initB2CIssuerForOAuth();
    console.log(`AAD B2C successfully initialized`);
  }

  private async initB2CIssuerForOAuth() {
    const microsftB2CIssuer = await Issuer.discover(
      this.configService.azure.b2cWellKnownOpenIdEndpoint,
    );

    console.log(`Discovered issuer: ${microsftB2CIssuer.issuer}`);
    this.metadata = microsftB2CIssuer.metadata;

    this.openIdClient = new microsftB2CIssuer.Client({
      client_id: this.configService.azure.clientId,
      client_secret: this.configService.azure.clientSecret,
      redirect_uris: [this.configService.azure.redirectUrlAcs],
      response_types: ['id_token'],
    });
    // Add minor tolerance to avoid JWT nbf issue.
    this.openIdClient[custom.clock_tolerance] = 10;

    console.log(`Supported claims: ${this.metadata.claims_supported}`);
    console.log(`Supported scopes: ${this.metadata.scopes_supported}`);
    console.log(`Metadata:`, this.metadata);
  }

  async getOpenIdSigninRedirectUrl(
    responseMode: OpenIdSignInResponseModes = 'form_post',
    scopes: string[] | null = null,
  ): Promise<{ url: string; responseMode: string; scopes: string[] }> {
    if (!['query', 'fragment', 'form_post'].includes(responseMode)) {
      throw new ArgumentError(`Unknown OpenId response mode: ${responseMode}`);
    }

    const scopesGen = scopes ? scopes : (this.metadata.scopes_supported as string[]);

    return {
      url: this.openIdClient.authorizationUrl({
        response_mode: responseMode,
        scope: scopesGen.join(' '),
      }),
      responseMode,
      scopes: scopesGen,
    };
  }

  async getOpenIdSignOutRedirectUrl(relayState?: string | null): Promise<string> {
    const retURL = new URL(this.configService.azure.redirectUrlAcs);
    retURL.searchParams.set('mode', 'sign-out');
    if (relayState) {
      retURL.searchParams.set('relay_state', relayState);
    }

    return this.openIdClient.endSessionUrl({
      post_logout_redirect_uri: retURL.toString(),
    });
  }

  async verifyOpenIdSigninAndGetClaims(req: IncomingMessage): Promise<SignInClaims> {
    const params = this.openIdClient.callbackParams(req);
    const tokenSet = await this.openIdClient.callback(
      this.configService.azure.redirectUrlAcs,
      params,
    );

    console.debug(`verifyOpenIdSigninAndGetClaims)=: received token and validated:`, tokenSet);
    console.debug(`verifyOpenIdSigninAndGetClaims)=: claims:`, tokenSet.claims());

    return tokenSet.claims() as SignInClaims;
  }

  async createUser(
    user: Partial<UserAdapterObject>,
    tenantId: string,
    newPassword?: string,
  ): Promise<UserAdapterObject> {
    console.debug(`createUser(..., ${tenantId})`, user);

    // Construct the user object
    // See: https://docs.microsoft.com/de-de/graph/api/resources/user?view=graph-rest-1.0#properties
    const newUser = {
      givenName: user.firstName,
      surname: user.lastName,
      displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.userName,
      preferredLanguage: 'en-US',
      accountEnabled: true,

      // The mail alias for the user. This property must be specified when a user
      // is created.
      // mailNickname: 'test',

      mail: user.email,

      // The user principal name (UPN) of the user. The UPN is an Internet-style
      // login name for the user based on the Internet standard RFC 822. By
      // convention, this should map to the user's email name. The general format
      // is alias@domain, where domain must be present in the tenant’s collection
      // of verified domains.
      userPrincipalName: `${uuidV4()}@${this.configService.azure.tenantName}`,

      identities: [
        {
          signInType: 'emailAddress',
          issuer: this.configService.azure.tenantName,
          issuerAssignedId: user.email,
        },
      ],

      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: newPassword || Math.random().toString(32),
      },

      // Required since AAD B2C sets by default the user password expiration
      // to 90 days despite the fact that it says in the documentation it won't
      passwordPolicies: 'DisablePasswordExpiration',

      [this.getExtensionFieldName(TENANT_ID_FIELD)]: tenantId,
    };

    let id = null;
    try {
      const newUserObj = await this.client.api('/users').post(newUser);
      id = newUserObj.id;

      console.debug(`New user created:`, newUserObj);
    } catch (ex) {
      console.error(`Error user info data:`, newUser);
      console.error(`Failed to create B2C User`, ex);

      if (ex && ex.message && ex.message.indexOf('already exists') > -1) {
        if (ex.message.indexOf('proxyAddresses already exists') > -1) {
          throw new Error(`A user with this email address is already existing.`);
        } else {
          throw new Error(`User is already existing.`);
        }
      }

      throw ex;
    }

    const createdUser = await this.getUserByIdForTenant(id, tenantId);

    if (!createdUser) {
      console.error(`Cannot fetch user after create: id=${id}, tenantId=${tenantId}`);
      throw new NotFoundError(`No such user for id ${id} after create!`);
    }

    return createdUser;
  }

  async getUsersForTenant(tenantId: string): Promise<UserAdapterObject[]> {
    const query = GraphApiFilterQueryBuilder.create().addFilterEqualsExtensionField(
      TENANT_ID_FIELD,
      tenantId,
      this.b2cExtensionsAppId.appId,
    );

    const results = await this.fetchUsersFromGraph(query, DEFAULT_FIELDS, [TENANT_ID_FIELD]);

    console.log('results ->>>>>>>>>>>>', results);

    return (results || []).map(r => this.transformUserToResult(r, tenantId));
  }

  async getSimpleUsersBulkForTenantById(
    userIds: string[],
    tenantId: string,
  ): Promise<UserAdapterObject[]> {
    if (!userIds || !Array.isArray(userIds) || userIds.length < 1) {
      return [];
    }

    const query = GraphApiFilterQueryBuilder.create()
      .addFilterEqualsExtensionField(TENANT_ID_FIELD, tenantId, this.b2cExtensionsAppId.appId)
      .orGroupArray(userIds.map(id => GraphApiFilterQueryBuilder.create().addFilterId(id)));

    try {
      const results = await this.fetchUsersFromGraph(
        query,
        ['displayName', 'givenName', 'mail', 'preferredLanguage', 'surname', 'id'],
        [TENANT_ID_FIELD],
      );

      return (results || []).map(r => this.transformUserToResult(r, tenantId));
    } catch (ex) {
      console.debug(`Invalid user identifier:`, userIds);
      return [];
    }
  }

  async getUserByIdForTenant(id: string, tenantId: string): Promise<UserAdapterObject | null> {
    const query = GraphApiFilterQueryBuilder.create()
      .addFilterEqualsExtensionField(TENANT_ID_FIELD, tenantId, this.b2cExtensionsAppId.appId)
      .addFilterId(id);

    const results = await this.fetchUsersFromGraph(query, DEFAULT_FIELDS, [TENANT_ID_FIELD]);
    try {
      return this.transformUserToResult(results[0], tenantId);
    } catch (ex) {
      console.debug(`No such user:`, ex);
    }

    return null;
  }

  async getUserById(id: string): Promise<UserAdapterObject | null> {
    const query = GraphApiFilterQueryBuilder.create().addFilterId(id);

    const results = await this.fetchUsersFromGraph(query, DEFAULT_FIELDS, [TENANT_ID_FIELD]);
    try {
      return this.transformUserToResult(results[0], '-');
    } catch (ex) {
      console.debug(`No such user:`, ex);
    }

    return null;
  }

  async getUserByUserName(username: string, tenantId: string): Promise<UserAdapterObject | null> {
    const query = GraphApiFilterQueryBuilder.create().addFilterEqualsExtensionField(
      TENANT_ID_FIELD,
      tenantId,
      this.b2cExtensionsAppId.appId,
    );

    const results = (await this.fetchUsersFromGraph(query, ['id', 'identities'])) as any[];

    const ret = (results || []).find(c => {
      return !!((c.identities as any[]) || []).find(
        i => i.signInType === 'emailAddress' && i.issuerAssignedId === username,
      );
    });

    if (!ret) {
      console.debug(`No such user found for name ${username} in ${tenantId}`);
      return null;
    }

    return this.getUserByIdForTenant(ret.id as string, tenantId);
  }

  async deleteUserByIdForTenant(id: string, tenantId: string): Promise<boolean> {
    console.debug(`deleteUserByIdForTenant(${id}, ${tenantId})`);

    const query = GraphApiFilterQueryBuilder.create()
      .addFilterEqualsExtensionField(TENANT_ID_FIELD, tenantId, this.b2cExtensionsAppId.appId)
      .addFilterId(id);

    const results = await this.fetchUsersFromGraph(query, ['id']);

    if (
      !results ||
      !Array.isArray(results) ||
      results.length < 1 ||
      !results[0] ||
      !results[0].id
    ) {
      console.debug(`No user found for id ${id} to delete (tenantId=${tenantId})`);
      throw new Error(`No such user.`);
    }
    console.debug(`OK, found user to delete (tenantId=${tenantId}):`, results);

    // Actually delete the user; this request does not have any response
    // https://docs.microsoft.com/de-de/graph/api/user-delete?view=graph-rest-1.0&tabs=http
    await this.client.api(`/users/${results[0].id}`).delete();

    return true;
  }

  async isUserNameGloballyAvailable(userName: string): Promise<boolean> {
    const query = GraphApiFilterQueryBuilder.create().addFilterEquals('mailNickname', userName);

    const results = await this.fetchUsersFromGraph(query, ['id']);

    return results.length < 1;
  }

  async updateUserByIdForTenant(
    id: string,
    tenantId: string,
    data: Partial<UserAdapterObject>,
  ): Promise<UserAdapterObject | null> {
    // Check if the user exists
    const query = GraphApiFilterQueryBuilder.create()
      .addFilterEqualsExtensionField(TENANT_ID_FIELD, tenantId, this.b2cExtensionsAppId.appId)
      .addFilterId(id);

    // Check if the users exists, because from here on we can than
    // rely on the fact that the id is from the correct user which
    // exists and is in the correct tenant
    const exists = await this.fetchUsersFromGraph(query, DEFAULT_FIELDS);
    if (exists.length != 1) {
      throw new Error(`No such user for id ${id}`);
    }

    const updateObject = this.transformToB2CUserObject(
      pickBy(
        {
          ...omit(data, 'additionalFields'),
        },
        identity,
      ),
    );

    console.debug(`updateUserByIdForTenant(): id=${id}, tenantId=${tenantId}`, updateObject);

    try {
      await this.client.api(`/users/${id}`).update({
        ...updateObject,
        // Required since AAD B2C sets by default the user password expiration
        // to 90 days despite the fact that it says in the documentation it won't
        passwordPolicies: 'DisablePasswordExpiration',
      });
    } catch (ex) {
      console.error(`GraphAPI change operation failed:`, ex);
      throw new Error(`Cannot update user: ${ex}`);
    }

    return this.getUserByIdForTenant(id, tenantId);
  }

  async updatePasswordForUser(id: string, tenantId: string, newPassword: string): Promise<boolean> {
    // Check if the user exists
    const query = GraphApiFilterQueryBuilder.create()
      .addFilterEqualsExtensionField(TENANT_ID_FIELD, tenantId, this.b2cExtensionsAppId.appId)
      .addFilterId(id);

    // Check if the users exists, because from here on we can than
    // rely on the fact that the id is from the correct user which
    // exists and is in the correct tenant
    const exists = await this.fetchUsersFromGraph(query, DEFAULT_FIELDS);
    if (exists.length != 1) {
      throw new Error(`No such user for id ${id}`);
    }

    try {
      await this.client.api(`/users/${id}`).patch({
        passwordProfile: {
          forceChangePasswordNextSignIn: false,
          password: newPassword,
        },
        // Required since AAD B2C sets by default the user password expiration
        // to 90 days despite the fact that it says in the documentation it won't
        passwordPolicies: 'DisablePasswordExpiration',
      });

      console.debug(`Password updated for ${id} @ ${tenantId}`);
    } catch (ex) {
      console.error(`Error user info data:`, ex);

      if (ex.message.indexOf('password complexity requirements') > -1) {
        throw new Error(`Password not complex enough`);
      }

      throw ex;
    }

    return true;
  }

  async validatePasswordByUserName(username: string, password: string): Promise<boolean> {
    if (
      !this.configService.azure.headlessROPCFlowUrl ||
      !this.configService.azure.headlessROPCFlowUrl.startsWith('http')
    ) {
      throw new Error(`Functionality not supported: env not configured!`);
    }

    /**
     * This function uses the "Configure the resource owner password credentials flow in Azure AD B2C"
     * trick to check a password for a user. See:
     * https://docs.microsoft.com/en-us/azure/active-directory-b2c/configure-ropc?tabs=app-reg-ga
     */

    try {
      const reqResult = await require('axios').post(
        this.configService.azure.headlessROPCFlowUrl,
        require('qs').stringify({
          grant_type: 'password',
          username,
          password,
          scope: this.configService.azure.graphApiClientId,
          response_type: 'token',
          client_id: this.configService.azure.graphApiClientId,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (reqResult.data.access_token && reqResult.data.access_token.length > 42) {
        return true;
      } else {
        console.error(`Cannot recognize response for validatePasswordByUserName:`, reqResult.data);
      }
    } catch (ex) {
      if (
        ex.response &&
        ex.response.status &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {
        throw new Error(`Wrong credentials. Access denied.`);
      }

      // Error message is: "The username or password provided in the request are invalid."
      if (
        ex.response.data.error_description &&
        ex.response.data.error_description.indexOf(`are invalid`) > -1
      ) {
        throw new Error(`Wrong credentials. Access denied.`);
      }

      console.error(`validatePasswordByUserName: API error: ${ex.response.data.error_description}`);

      if (
        ex.response &&
        ex.response.status &&
        (ex.response.status === 400 || ex.response.status >= 500)
      ) {
        throw new Error(`B2C API error returned`);
      }

      throw new Error(`Processing request failed!`);
    }

    // Failed
    return false;
  }

  async getApiTokenForClientSecret(clientId: string, clientSecret: string): Promise<ApiToken> {
    let reqResult;
    try {
      reqResult = await require('axios').post(
        `https://login.microsoftonline.com/${this.configService.azure.graphApiAuthorityId}/oauth2/v2.0/token`,
        require('qs').stringify({
          client_id: clientId,
          scope: 'https://graph.microsoft.com/.default openid profile',
          client_secret: clientSecret,
          grant_type: 'client_credentials',
          response_type: 'id_token token',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (ex) {
      if (
        ex.response &&
        ex.response.status &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {
        throw new Error(`Wrong credentials. Access denied.`);
      }

      console.error(`Cannot authenticate for app ${clientId} (API Token)`, ex);

      throw new Error(`Authentication failed - illegal token`);
    }

    const data: any = decode(reqResult.data.access_token);

    if (!data) {
      throw new NotFoundError('No such token found');
    }

    const appId = data.appid as string;

    const appsRetval = await this.client
      .api('/applications')
      .filter(GraphApiFilterQueryBuilder.create().addFilterEquals('appId', appId).build())
      .get();

    if (!appsRetval || appsRetval.value.length < 1) {
      throw new Error(`No such token found!`);
    }

    const tagMap: {
      name?: string;
      tenant?: string;
      issuperadminapp?: string;
    } = {};
    (appsRetval.value[0].tags || [])
      .map((t: string) => {
        const idx = t.indexOf(':');
        return idx > 0 ? [t.substring(0, idx), t.substring(idx + 1)] : null;
      })
      .forEach((t: string[] | null) => {
        if (t) {
          // @ts-ignore
          tagMap[t[0].toLowerCase()] = t[1];
        }
      });

    const creds = appsRetval.value[0].passwordCredentials || [];
    if (!creds || creds.length < 1) {
      throw new NotFoundError('No credentials found for app');
    }

    const apiToken: ApiToken = {
      id: appsRetval.value[0].id,
      appId: appsRetval.value[0].appId,
      name: tagMap.name || '',
      createdAt: appsRetval.value[0].createdDateTime,
      expiresAt: creds[0].endDateTime,
      tenantId: tagMap.tenant || '',
      secret: creds[0].hint,
      scopes: [tagMap.issuperadminapp === 'true' ? SCOPE_SUPER_ADMIN_PERMS : ''].filter(
        s => !!s.trim(),
      ),
    };

    return apiToken;
  }

  async getAllApiTokens(tenantId: string): Promise<ApiToken[]> {
    const appNamePrefix = this.getApiTokenAzureAppName(tenantId);
    const appsRetval = await this.client
      .api('/applications')
      .filter(
        GraphApiFilterQueryBuilder.create()
          .addFilterStartsWith('displayName', appNamePrefix)
          .build(),
      )
      .get();

    return (appsRetval.value || [])
      .map((v: any) => this.toExternal(v))
      .filter((v: any) => !!v && v.tenantId === tenantId);
  }

  async getSimpleApiTokenBulkForTenantId(ids: string[], tenantId: string): Promise<ApiToken[]> {
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return [];
    }

    const appNamePrefix = this.getApiTokenAzureAppName(tenantId);

    const appsRetval = await this.client
      .api('/applications')
      .filter(
        GraphApiFilterQueryBuilder.create()
          .addFilterStartsWith('displayName', appNamePrefix)
          .orGroupArray(ids.map(id => GraphApiFilterQueryBuilder.create().addFilterId(id)))
          .build(),
      )
      .get();

    return (appsRetval.value || [])
      .map((v: any) => this.toExternal(v))
      .filter((v: any) => !!v && v.tenantId === tenantId);
  }

  private toExternal(data: any): any {
    const tagMap: {
      name?: string;
      tenant?: string;
    } = {};
    (data.tags || [])
      .map((t: string) => {
        const idx = t.indexOf(':');
        return idx > 0 ? [t.substring(0, idx), t.substring(idx + 1)] : null;
      })
      .forEach((t: string[] | null) => {
        if (t) {
          // @ts-ignore
          tagMap[t[0].toLowerCase()] = t[1];
        }
      });

    const creds = data.passwordCredentials || [];
    if (!creds || creds.length < 1) {
      return null;
    }

    const apiToken: ApiToken = {
      id: data.id,
      appId: data.appId,
      name: tagMap.name || '',
      createdAt: data.createdDateTime,
      expiresAt: creds[0].endDateTime,
      tenantId: tagMap.tenant || '',
      secret: creds[0].secretText ? creds[0].secretText : creds[0].hint,
      scopes: [],
    };

    return apiToken;
  }

  async createNewApiToken(tenantId: string, name: string, scopes: string[]): Promise<ApiToken> {
    // https://docs.microsoft.com/de-de/graph/api/application-post-applications?view=graph-rest-1.0&tabs=http
    const resultAppCreation = await this.client.api('/applications').post({
      displayName: this.getApiTokenAzureAppName(tenantId, true),
      tags: [`tenant:${tenantId}`, `name:${name}`],
    });

    // https://docs.microsoft.com/de-de/graph/api/application-addpassword?view=graph-rest-1.0&tabs=http
    const appPasswordCreation = await this.client
      .api('/applications/' + resultAppCreation.id + '/addPassword')
      .post({
        displayName: "Auto generated key (DON'T DELETE OR APP STOPS WORKING)",
        endDateTime: '2040-12-31T00:00:00Z',
      });

    const ext = this.toExternal({
      ...resultAppCreation,
      passwordCredentials: [appPasswordCreation],
    });
    return ext;
  }

  private getApiTokenAzureAppName(tenantId: string, withRandom = false): string {
    if (!tenantId) {
      throw new Error(`TenantId is required to get an API token app name! Can't continue without!`);
    }

    const randomString = `${Math.random().toString(32).substring(2)}`;
    const tenantName = `tenant-${tenantId}`.toLowerCase();
    return `Azure SP DF-${
      this.configService.azure.deploymentEnvDisplayName
    } API Token ${tenantName} ${withRandom ? randomString : ''}`.trim();
  }

  async deleteApiToken(tenantId: string, tokenId: string): Promise<boolean> {
    const all = await this.getAllApiTokens(tenantId);
    const exists = all.find(token => token.id === tokenId);

    if (!exists) {
      throw new Error(`No such API token`);
    }

    // https://docs.microsoft.com/de-de/graph/api/application-delete?view=graph-rest-1.0&tabs=http
    await this.client.api(`/applications/${exists.id}`).delete();
    return true;
  }

  // ---

  private transformToB2CUserObject(input: any): any {
    const renamings = {
      firstName: 'givenName',
      lastName: 'surname',
      email: 'mail',
    };

    delete input.userName;

    for (const key in renamings) {
      if (typeof input[key] !== 'undefined') {
        // @ts-ignore
        input[renamings[key]] = input[key];
        delete input[key];
      }
    }

    if (typeof input['preferredLanguage'] !== undefined) {
      input['preferredLanguage'] = 'en-US';
    }

    return input;
  }

  private transformUserToResult(input: any, tenantId: string): UserAdapterObject {
    const ret = {
      id: input.id,
      firstName: input.givenName || null,
      lastName: input.surname || null,
      userName: input.displayName,
      email: input.mail,
      displayName: input.displayName || `${input.givenName} ${input.surname}`.trim() || null,
      preferredLanguage: 'en-US',
      roles: input.roles,
      tenantId: input.TenantId || tenantId,
      identities: (input.identities || []).map(
        (identity: any) =>
          ({
            type: identity.signInType,
            value: identity.issuerAssignedId,
          } as UserAdapterIdentityObject),
      ),
      additionalFields: {},
    } as UserAdapterObject;

    // Correct values
    // const usrName = ret.identities.find(i => i.type === 'userName');
    // if (usrName) {
    //     ret.userName = usrName.value;
    // }

    // const realMail = ret.identities.find(i => i.type === 'emailAddress');
    // if (realMail) {
    //     ret.email = realMail.value;
    // }

    return ret;
  }

  private getExtensionFieldName(name: string): string {
    return `extension_${this.b2cExtensionsAppId.appIdTransformed}_${name}`;
  }

  private async fetchUsersFromGraph(
    filter?: GraphApiFilterQueryBuilder | null,
    select?: string[] | null,
    extensionFields?: string[] | null,
  ): Promise<GraphApiUserResponse[]> {
    console.debug(`fetchUsersFromGraph(): select=`, select, `extensionFields=`, extensionFields);

    const req = this.client.api(`/users`);
    const extFieldsMap: { [key: string]: string } = {};

    // Add filters
    let filterStatement;
    if (filter) {
      filterStatement = filter.build();
      console.debug(`$filter=${filterStatement}`);
      req.filter(filterStatement);
    }

    // Add selection statement
    let selectStatement;
    if (select || extensionFields) {
      const selectFields = [...(select ? select : [])];

      // If extension fields are supplied, add them
      if (extensionFields) {
        for (const extensionFieldName of extensionFields) {
          const keyName = this.getExtensionFieldName(extensionFieldName);
          extFieldsMap[keyName] = extensionFieldName;
          selectFields.push(keyName);
        }
      }

      selectStatement = selectFields.join(',');
      console.debug(`$select=${selectStatement}`);
      req.select(selectStatement);
    }

    // Fetch
    const resp = await req.get();

    if (!resp || !resp.value || !Array.isArray(resp.value)) {
      console.error(
        `GraphAPI request failed: $filter=${filterStatement}, $select=${selectStatement}`,
      );
      throw new Error(`Request to GraphAPI failed: no results returned`);
    }

    console.debug(`Got ${resp.value.length} results from GraphAPI`);

    // Overlay the extension fields with the "readable" names
    for (let i = 0; i < resp.value.length; i++) {
      for (const key in extFieldsMap) {
        if (typeof resp.value[i][key] !== 'undefined') {
          resp.value[i][extFieldsMap[key]] = resp.value[i][key];
          delete resp.value[i][key];
        }
      }
    }

    return resp.value || [];
  }

  /**
   * Reads the ID of the b2c-extensions-app, which is hard-coded into
   * the Azure B2C apps. This ID is needed to extract custom defined
   * fields. See official Microsoft docu:
   *
   * @see https://docs.microsoft.com/de-de/azure/active-directory-b2c/user-profile-attributes#extension-attributes
   */
  private async loadExtensionAzureADB2CAppId(): Promise<void> {
    let apps = [];

    // Fetch the apps
    try {
      const appsRetval = await this.client.api('/applications').get();
      apps = appsRetval.value;
    } catch (ex) {
      console.error(`Cannot read Azure AD app registrations: `, ex);
      console.error(`At least the permission "Application.Read.All" needs to be set!`);
      throw ex;
    }

    /*
     * The app will be called: 'b2c-extensions-app. Do not modify. Used by AADB2C for storing user data.'
     * This is hard-coded in Azure, so we can search for it in the following for-loop
     */
    for (const app of apps) {
      if (app.displayName.toLowerCase().indexOf('b2c-extensions-app') > -1) {
        // Set the discovered app ids
        this.b2cExtensionsAppId = {
          appId: app.appId,
          appIdTransformed: app.appId.replace(/\-/g, ''),
        };

        console.log(`B2C extensions app: ID=${this.b2cExtensionsAppId.appId}`);
        console.log(
          `B2C extensions app: TRANSFORMED_ID=${this.b2cExtensionsAppId.appIdTransformed}`,
        );

        return;
      }
    }

    throw new Error(`Cannot find application "b2c-extensions-app" in connected AAD!`);
  }
}
