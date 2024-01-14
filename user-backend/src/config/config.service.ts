import { LogLevels } from '@elunic/logger';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as fs from 'fs';
import * as Joi from 'joi';
import { Algorithm } from 'jsonwebtoken';
import * as path from 'path';
import { AbstractConfigService, AbstractConfigServiceSchema } from 'shared/backend';

import { switchEnv } from './switchEnv';

dotenvExpand(dotenv.config());

/**
 * Configuration validation schema - when changing the configuration, adjust this first,
 * then change the ConfigService until the config instance validates
 */
const CONFIG_SCHEMA = AbstractConfigServiceSchema.keys({
  httpPort: Joi.number().integer().greater(0).required(),

  database: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().greater(0).required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
    name: Joi.string().required(),
    ssl: Joi.boolean().required(),
  }),

  redirectOnValidationFail: Joi.boolean().required(),
  baseUrl: Joi.string().required(),
  defaultRedirectUrl: Joi.string().required(),
  tenantRedirectUrl: Joi.string().required(),
  authCookieName: Joi.string().required(),
  sessionTime: Joi.number().required(),

  log: Joi.object().keys({
    level: Joi.string().valid(
      LogLevels.Trace,
      LogLevels.Debug,
      LogLevels.Info,
      LogLevels.Warn,
      LogLevels.Error,
      LogLevels.Fatal,
    ),
    namespace: Joi.string().required(),
    logPath: Joi.string().optional(),
  }),

  jwt: Joi.object().keys({
    jwtInternalAlgorithm: Joi.string().required(),
    ignore: Joi.bool().required(),
    jwtPublic: Joi.alternatives(Joi.string(), Joi.binary()).required().allow(''),
    jwtSecret: Joi.alternatives(Joi.string(), Joi.binary()).required().allow(''),
    jwtExpiresIn: Joi.string().required(),
  }),
  jwtInternal: Joi.object().keys({
    jwtInternalPublic: Joi.string().required().allow(''),
    jwtInternalSecret: Joi.string().required().allow(''),
  }),

  azure: Joi.object({
    graphApiClientId: Joi.optional(),
    graphApiSecret: Joi.optional(),
    graphApiAuthorityId: Joi.optional(),
    tenantName: Joi.optional(),
    b2cWellKnownOpenIdEndpoint: Joi.optional(),
    clientId: Joi.optional(),
    clientSecret: Joi.optional(),
    redirectUrlAcs: Joi.optional(),
    headlessROPCFlowUrl: Joi.optional(),
    deploymentEnvDisplayName: Joi.optional(),
  }),

  keycloak: Joi.object({
    baseUrl: Joi.optional(),
    realmName: Joi.optional(),
    clientId: Joi.optional(),
    clientSecret: Joi.optional(),
    frontendClientId: Joi.optional(),
    wellKnownEndpoint: Joi.optional(),
    redirectUrlAcs: Joi.optional(),
  }),

  superadmin: Joi.object().keys({
    enabled: Joi.boolean().required(),
    username: Joi.string().optional(),
    password: Joi.string().optional(),
  }),

  admin: Joi.object().keys({
    username: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
  }),
});

/**
 * Configuration Object, implemented as injectable ConfigService
 */
@Injectable()
export class ConfigService extends AbstractConfigService {
  httpPort = Number(process.env.APP_PORT) || Number(process.env.APP_PORT_USER) || 8083;

  externalServiceUrl = switchEnv(
    {
      e2e: 'http://localhost:8083',
    },
    String(process.env.APP_SERVICE_URL || process.env.APP_SERVICE_URL_USER || ''),
  );

  database = {
    host: process.env.APP_DB_HOST || '',
    port: Number(process.env.APP_DB_PORT) || 3306,
    user: process.env.APP_DB_USER || '',
    pass: process.env.APP_DB_PASS || '',
    name: process.env.APP_DB_NAME || '',
    ssl: [1, '1', true, 'true'].includes(process.env.APP_DB_SSL || ''),
  };

  jwt = switchEnv(
    {
      development: {
        jwtInternalAlgorithm: 'RS256' as Algorithm,
        ignore: process.env.AUTH_IGNORE_JWT === 'true',
        jwtPublic:
          process.env.AUTH_JWT_PUBLIC ||
          fs.readFileSync(path.join(process.cwd(), 'data/certs/development/jwt.key.pub')),
        jwtSecret:
          process.env.AUTH_JWT_SECRET ||
          fs.readFileSync(path.join(process.cwd(), 'data/certs/development/jwt.key')),
        jwtExpiresIn: '60m',
      },
      test: {
        jwtInternalAlgorithm: 'RS256' as Algorithm,
        ignore: process.env.AUTH_IGNORE_JWT === 'true',
        jwtPublic: process.env.AUTH_JWT_PUBLIC,
        jwtSecret: process.env.AUTH_JWT_SECRET,
        jwtExpiresIn: '60m',
      },
      production: {
        jwtInternalAlgorithm: 'RS256' as Algorithm,
        ignore: process.env.AUTH_IGNORE_JWT === 'true',
        jwtPublic: process.env.AUTH_JWT_PUBLIC,
        jwtSecret: process.env.AUTH_JWT_SECRET,
        jwtExpiresIn: '60m',
      },
    },
    {
      jwtInternalAlgorithm: 'RS256' as Algorithm,
      ignore: process.env.AUTH_IGNORE_JWT === 'true',
      jwtPublic: process.env.AUTH_JWT_PUBLIC,
      jwtSecret: process.env.AUTH_JWT_SECRET,
      jwtExpiresIn: '60m',
    },
  );

  // Traefik ingress requires this to be set.
  redirectOnValidationFail = [1, '1', true, 'true'].includes(
    process.env.APP_REDIRECT_ON_VALIDATION_FAIL || '',
  );
  baseUrl = process.env.APP_SERVICE_URL || (process.env.APP_SERVICE_URL_USER as string);
  defaultRedirectUrl = process.env.APP_FRONTEND_URL_HUB || 'http://localhost:8080';
  tenantRedirectUrl = process.env.APP_FRONTEND_URL_TENANT || 'http://localhost:8080';
  authCookieName = process.env.AUTH_COOKIE_NAME || '__sfapps_session';
  sessionTime = 60 * 60 * 4; // 4h

  log = {
    level: (process.env.LOG_LEVEL || 'info') as LogLevels,
    namespace: 'app',
    logPath: process.env.APP_LOG_PATH || undefined,
  };

  superadmin = {
    enabled: process.env.AUTH_SUPERADMIN_ENABLED === 'true',
    username: process.env.AUTH_SUPERADMIN_USERNAME,
    password: process.env.AUTH_SUPERADMIN_PASSWORD,
  };

  admin = {
    username: process.env.SEED_ADMIN_USERNAME || 'admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@admin.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'admin',
  };

  azure = {
    graphApiClientId: process.env.GRAPH_CLIENT_ID || '',
    graphApiSecret: process.env.GRAPH_SECRET || '',
    graphApiAuthorityId: process.env.GRAPH_AUTHORITY_ID || '',
    tenantName: process.env.MS_AD_TENANT_NAME || '',
    b2cWellKnownOpenIdEndpoint: process.env.MS_AD_B2C_WELLNOWN_OPENID_URL || '',
    clientId: process.env.MS_AD_B2C_CLIENT_ID || '',
    clientSecret: process.env.MS_AD_B2C_CLIENT_SECRET || '',
    redirectUrlAcs:
      process.env.MS_AD_B2C_REDIRECT_URL || this.baseUrl
        ? this.baseUrl + '/v1/auth/acs'
        : 'http://localhost:8083/v1/auth/acs',
    headlessROPCFlowUrl: process.env.B2C_ROPC_FLOW_URL || '',
    deploymentEnvDisplayName: 'Dev',
  };

  keycloak = {
    baseUrl: process.env.KEYCLOAK_BASE_URL || '',
    realmName: process.env.KEYCLOAK_REALM_NAME || '',
    clientId: process.env.KEYCLOAK_CLIENT_ID || '',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    frontendClientId: process.env.KEYCLOAK_FRONTEND_CLIENT_ID || '',
    // Fallback legacy env with typo.
    wellKnownEndpoint:
      process.env.KEYCLOAK_WELLKNOWN_OPENID_URL || process.env.KEYCLOAK_WELLKOWN_OPENID_URL || '',
    redirectUrlAcs: this.baseUrl
      ? this.baseUrl + '/v1/auth/acs'
      : 'http://localhost:8083/v1/auth/acs',
  };

  jwtInternal = switchEnv(
    {
      development: {
        jwtInternalPublic: process.env.AUTH_INTERNAL_JWT_PUBLIC || '',
        jwtInternalSecret: process.env.AUTH_INTERNAL_JWT_SECRET || '',
      },
    },
    {
      jwtInternalPublic: process.env.AUTH_INTERNAL_JWT_PUBLIC as string | Buffer,
      jwtInternalSecret: process.env.AUTH_INTERNAL_JWT_SECRET as string | Buffer,
    },
  );

  getJwtInternalPublic(): Buffer {
    if (!this.jwtInternal.jwtInternalPublic) {
      this.jwtInternal.jwtInternalPublic = fs.readFileSync(
        path.join(process.cwd(), 'data/certs/development/internal.key.pub'),
      );
    }

    return this.jwtInternal.jwtInternalPublic as Buffer;
  }

  getJwtInternalSecret(): Buffer {
    if (!this.jwtInternal.jwtInternalSecret) {
      this.jwtInternal.jwtInternalSecret = fs.readFileSync(
        path.join(process.cwd(), 'data/certs/development/internal.key'),
      );
    }

    return this.jwtInternal.jwtInternalSecret as Buffer;
  }
}

// This line ensures the configuration object matches the defined schema
Joi.assert(new ConfigService(), CONFIG_SCHEMA, 'Invalid configuration');
