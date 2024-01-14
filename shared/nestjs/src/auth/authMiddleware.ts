import { createLogger } from '@elunic/logger';
import { Logger, LogLevels } from '@elunic/logger/types';
import { HttpException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import cookieParser = require('cookie-parser');
import { Express, NextFunction, Request, Response } from 'express';
import { decode, verify } from 'jsonwebtoken';
import { AbstractConfigService } from 'shared/backend';
import { AuthInfo, AuthRoles } from 'shared/common/types';

const COOKIE_NAME = '__sfapps_session';

const MOCK_AUTH_INFO_FOR_DEV: AuthInfo = {
  id: 'dd188ea8-2847-4ff8-9142-e9364bcd95f4',
  tenantId: '8e640e8c-12e2-4725-b16a-c6ba889c5fb1',
  iat: Date.now(),
  roles: [AuthRoles.SCHULER_ADMIN],
  name: 'Daniel Demo',
  userLang: 'de',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRkMTg4ZWE4LTI4NDctNGZmOC05MTQyLWU5MzY0YmNkOTVmNCIsInRlbmFudElkIjoiOGU2NDBlOGMtMTJlMi00NzI1LWIxNmEtYzZiYTg4OWM1ZmIxIiwiaWF0IjoyOTM4NDkzMjgyOTIsIm5hbWUiOiJEYW5pZWwgRGVtbyIsInVzZXJMYW5nIjoiZGUifQ.YP_7nU9U5ICDhKwDAdx2uOOf69FeRhgw2v3XS1LzTnQ',
  isMultitenant: false,
};

export function createAuthMiddleware(adapter: HttpAdapterHost, config: AbstractConfigService) {
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  const logger = createLogger('authMiddleware', {
    consoleLevel: (process.env.LOG_LEVEL || 'info') as LogLevels,
  });

  // Get the express app
  const httpAdapter = adapter.httpAdapter;
  const instance = httpAdapter.getInstance();

  const expressApp: Express = <Express>instance;

  // Add the middlewares
  expressApp.use(cookieParser());

  /**
   * Actual express middleware which reads out the authentication data
   * for the current request
   */
  return async (req: Request, res: Response, next: NextFunction) => {
    // Try to extract the token from the session cookie
    const tokenResult = getTokenFromRequest(req, COOKIE_NAME);

    // TODO FIXME validate the token!!!!
    if (tokenResult) {
      req.auth = decode(tokenResult) as AuthInfo;
    } else {
      const internalToken = getTokenFromAuthorizationHeader(req, 'X-Internal-Authorization');
      if (internalToken) {
        verify(internalToken, config.internalTokenSecret);
        const auth: AuthInfo = {
          ...(decode(internalToken) as AuthInfo),
          __isInternal: true,
        };
        req.auth = auth;
      }
    }
    // Handle the case of local dev
    handleLocalDevToken(req, logger);

    if (!req.auth) {
      next(new HttpException('Not authorized! Illegal access method or illegal token', 401));
      return;
    }

    next();
    return;
  };
}

function handleLocalDevToken(req: Request, logger: Logger) {
  if (req.auth) {
    return; // Already set, nothing to do
  }

  if (['1', 'on', 'true'].includes(process.env.APP_FORCE_MOCK_AUTH || '')) {
    logger.debug(`Using local dev token mock, because APP_FORCE_MOCK_AUTH set`);
    req.auth = MOCK_AUTH_INFO_FOR_DEV;
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    req.auth = MOCK_AUTH_INFO_FOR_DEV;
    return;
  }
}

export function getTokenFromRequest(req: Request, authCookieName: string): string | null {
  // Extract the token
  let token = getTokenFromCookies(req, authCookieName);
  if (!token) {
    token = getTokenFromAuthorizationHeader(req, 'Authorization');
  }

  return token || null;
}

/**
 * Tries to extract the session token from an Authorization HTTP header:
 *
 *      Authorization: Bearer YWxhZGRpbjpvcGVuc2VzYW1l
 *
 * and returns either the token or `null` if not found.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
 */
function getTokenFromAuthorizationHeader(req: Request, header: string): string | null {
  const parts = (req.header(header) || '').split(' ');
  if (parts.length === 2 && parts[0].length && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

/**
 * Tries to extract the session token from the cookie header and returns
 * either the token or `null` if not found.
 */
function getTokenFromCookies(req: Request, authCookieName: string): string | null {
  if (!req.cookies) {
    return null;
  }

  const token = req.cookies[authCookieName];
  return typeof token === 'string' && token && token.length > 0 ? token : null;
}
