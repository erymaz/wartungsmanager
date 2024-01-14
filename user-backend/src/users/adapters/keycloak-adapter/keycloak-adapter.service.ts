import 'isomorphic-fetch';

import KcAdminClient from '@keycloak/keycloak-admin-client';
import CredentialRepresentation from '@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import { Injectable } from '@nestjs/common';
import { ArgumentError, NotImplementedError } from 'common-errors';
import { IncomingMessage } from 'http';
import { Client as OpenIdClient, Issuer, IssuerMetadata } from 'openid-client';
import { AuthRoles } from 'shared/common/types';

import { ConfigService } from '../../../config/config.service';
import {
  IdPServiceAdapter,
  OpenIdSignInResponseModes,
  SignInClaims,
} from '../abstract-idp-service-adapter';
import { ApiToken } from '../dto/ApiToken';
import { UserAdapterObject } from '../dto/UserAdapterObject';

type KeycloakAttributes = Pick<
  UserAdapterObject,
  'displayName' | 'preferredLanguage' | 'isSuperuser'
>;
interface KeycloakUserDto extends UserRepresentation {
  attributes: KeycloakAttributes;
}

@Injectable()
export class KeycloakAdapterService implements IdPServiceAdapter {
  private keycloakClient!: KcAdminClient;
  private metadata!: IssuerMetadata;
  private openIdClient!: OpenIdClient;

  constructor(private config: ConfigService) {}

  async init() {
    const issuer = await Issuer.discover(this.config.keycloak.wellKnownEndpoint);

    this.metadata = issuer.metadata;
    this.openIdClient = new issuer.Client({
      client_id: this.config.keycloak.frontendClientId,
      redirect_uris: [this.config.keycloak.redirectUrlAcs],
      response_types: ['id_token'],
    });
    this.keycloakClient = new KcAdminClient({
      baseUrl: this.config.keycloak.baseUrl,
      realmName: this.config.keycloak.realmName,
    });

    const credentials: Credentials = {
      grantType: 'client_credentials',
      clientId: this.config.keycloak.clientId,
      clientSecret: this.config.keycloak.clientSecret,
    };
    await this.keycloakClient.auth(credentials);
    // TODO: Refresh interval should come from some config.
    // Refresh token every 58 seconds.
    setInterval(() => this.keycloakClient.auth(credentials), 58 * 1000);
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
        nonce: '-',
      }),
      responseMode,
      scopes: scopesGen,
    };
  }

  async getOpenIdSignOutRedirectUrl(relayState?: string | null): Promise<string> {
    const retURL = new URL(this.config.keycloak.redirectUrlAcs);
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
    const tokenSet = await this.openIdClient.callback(this.config.keycloak.redirectUrlAcs, params, {
      nonce: '-',
    });

    console.log(`verifyOpenIdSigninAndGetClaims)=: received token and validated:`, tokenSet);
    console.log(`verifyOpenIdSigninAndGetClaims)=: claims:`, tokenSet.claims());

    return tokenSet.claims() as SignInClaims;
  }

  async createUser(
    user: Partial<UserAdapterObject>,
    tenantId: string,
    newPassword?: string,
  ): Promise<UserAdapterObject> {
    const dto: KeycloakUserDto = this.mapUserAdapterObjectToKeycloakUserDto({
      ...user,
      tenantId,
      preferredLanguage: user.preferredLanguage || 'en',
    } as UserAdapterObject);
    const newUser = await this.keycloakClient.users.create(dto);
    const credential: CredentialRepresentation = {
      temporary: false,
      type: 'password',
      value: newPassword,
    };

    this.keycloakClient.users.resetPassword({
      id: newUser.id,
      credential,
    });

    return (await this.getUserById(newUser.id)) as UserAdapterObject;
  }

  async getUsersForTenant(tenantId: string): Promise<UserAdapterObject[]> {
    const dtos = (await this.keycloakClient.groups.listMembers({
      id: tenantId,
    })) as KeycloakUserDto[];

    const users = (dtos || []).map(dto => {
      return this.mapKeycloakUserDtoToUserAdapterObject(dto);
    });

    return Promise.all(users);
  }

  async getSimpleUsersBulkForTenantById(
    userIds: string[],
    tenantId: string,
  ): Promise<UserAdapterObject[]> {
    const dtos = await this.keycloakClient.groups.listMembers({ id: tenantId });
    return Promise.all(
      dtos
        .filter(dto => userIds.includes(dto.id as string))
        .map(dto => this.mapKeycloakUserDtoToUserAdapterObject(dto as KeycloakUserDto)),
    );
  }

  async getUserByIdForTenant(id: string, tenantId: string): Promise<UserAdapterObject | null> {
    const dto = await this.keycloakClient.users.findOne({
      id,
    });

    if (!dto) {
      return null;
    }

    const user = await this.mapKeycloakUserDtoToUserAdapterObject(dto as KeycloakUserDto);
    if (user.tenantId !== tenantId) {
      return null;
    }
    return user;
  }

  async getUserById(id: string): Promise<UserAdapterObject | null> {
    const user = (await this.keycloakClient.users.findOne({ id })) as KeycloakUserDto;

    return this.mapKeycloakUserDtoToUserAdapterObject(user);
  }

  async getUserByUserName(username: string, tenantId: string): Promise<UserAdapterObject | null> {
    const dtos = await this.keycloakClient.users.find({
      username,
    });

    if (dtos.length < 1) {
      return null;
    }
    const user = await this.mapKeycloakUserDtoToUserAdapterObject(dtos[0] as KeycloakUserDto);
    if (user.tenantId !== tenantId) {
      return null;
    }
    return user;
  }

  async deleteUserByIdForTenant(id: string, tenantId: string): Promise<boolean> {
    const user = await this.getUserByIdForTenant(id, tenantId);

    if (user) {
      await this.keycloakClient.users.del({ id: user.id });
      return true;
    }

    return false;
  }

  async isUserNameGloballyAvailable(userName: string): Promise<boolean> {
    const [dto] = await this.keycloakClient.users.find({ username: userName });
    return !dto;
  }

  async updateUserByIdForTenant(
    id: string,
    tenantId: string,
    data: Partial<UserAdapterObject>,
  ): Promise<UserAdapterObject | null> {
    const user = await this.getUserByIdForTenant(id, tenantId);
    if (!user) {
      return null;
    }

    await this.keycloakClient.users.update(
      { id },
      this.mapUserAdapterObjectToKeycloakUserDto({ ...user, ...data }),
    );
    return this.getUserByIdForTenant(id, tenantId);
  }

  async updatePasswordForUser(id: string, tenantId: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByIdForTenant(id, tenantId);

    if (user) {
      await this.keycloakClient.users.resetPassword({
        id,
        credential: {
          temporary: false,
          type: 'password',
          value: newPassword,
        },
      });
      return true;
    }

    return false;
  }

  async getApiTokenForClientSecret(clientId: string, clientSecret: string): Promise<ApiToken> {
    const credentials: Credentials = {
      grantType: 'client_credentials',
      clientId,
      clientSecret,
    };
    await this.keycloakClient.auth(credentials);
    return (await this.keycloakClient.getAccessToken()) as ApiToken;
  }

  async getAllApiTokens(tenantId: string): Promise<ApiToken[]> {
    throw new NotImplementedError(`Not implemented for keycloak-adapter`);
  }

  async getSimpleApiTokenBulkForTenantId(ids: string[], tenantId: string): Promise<ApiToken[]> {
    throw new NotImplementedError(`Not implemented for keycloak-adapter`);
  }

  async validatePasswordByUserName(username: string, password: string): Promise<boolean> {
    throw new NotImplementedError(`Not implemented for keycloak-adapter`);
  }

  async createNewApiToken(tenantId: string, name: string, scopes: string[]): Promise<ApiToken> {
    throw new NotImplementedError(`Not implemented for keycloak-adapter`);
  }

  async deleteApiToken(tenantId: string, tokenId: string): Promise<boolean> {
    throw new NotImplementedError(`Not implemented for keycloak-adapter`);
  }

  private mapUserAdapterObjectToKeycloakUserDto(
    user: Omit<UserAdapterObject, 'id'>,
  ): KeycloakUserDto {
    const { firstName, lastName, userName, email, tenantId, ...attributes } = user;

    const dto: KeycloakUserDto = {
      firstName: firstName as string,
      lastName: lastName as string,
      username: userName as string,
      email,
      groups: [tenantId],
      attributes: {
        displayName: '',
        isSuperuser: false,
        ...attributes,
      },
    };

    return dto;
  }

  private async mapKeycloakUserDtoToUserAdapterObject(
    keycloakUser: KeycloakUserDto,
    tenant?: string,
  ): Promise<UserAdapterObject> {
    const keycloakGroups = this.keycloakClient.users.listGroups({
      id: keycloakUser.id as string,
    }) as Promise<GroupRepresentation[]>;
    const keycloakRoles = this.keycloakClient.users.listRoleMappings({
      id: keycloakUser.id as string,
    });
    const [groups, roles] = await Promise.all([keycloakGroups, keycloakRoles]);

    const filteredRoles =
      roles?.realmMappings
        ?.map(role => role.name)
        .filter(name => Object.values(AuthRoles).some(value => value === name)) || [];

    const tenantId = tenant || groups.length ? groups[0].name || '' : '';

    const user: UserAdapterObject = {
      ...keycloakUser.attributes,
      id: keycloakUser.id as string,
      firstName: keycloakUser.firstName as string,
      lastName: keycloakUser.lastName as string,
      userName: keycloakUser.username as string,
      roles: filteredRoles as AuthRoles[],
      email: keycloakUser.email as string,
      identities: [],
      tenantId,
      isSuperuser: !groups.length,
    };

    return user;
  }
}
