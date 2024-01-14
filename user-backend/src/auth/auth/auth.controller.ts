import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RedirectResponse } from '@nestjs/core/router/router-response-controller';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as NodeCache from 'node-cache';
import { AuthInfo } from 'shared/common/types';
import urlJoin = require('url-join');

import { ConfigService } from '../../config/config.service';
import { DataResponse } from '../../lib/data-response';
import { AUTH } from '../../routes';
import { IdPServiceAdapter } from '../../users/adapters/abstract-idp-service-adapter';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { TokenDto } from './dto/LoginDto';

interface RelayState {
  iat: number;
  tenantId: string;
}
const RelayStateCookie = '__df_relay_state';

@Controller(AUTH.PREFIX)
@ApiTags('ACL')
export class AuthController {
  private relayStateTokens: NodeCache;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtAuthService,
    private readonly idpService: IdPServiceAdapter,
  ) {
    this.relayStateTokens = new NodeCache();
  }

  @Get(AUTH.ROUTES.LOGIN.path)
  @ApiOperation({ summary: 'Loading login page' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 200, description: 'Login page is loaded' })
  @UseGuards(...AUTH.ROUTES.LOGIN.guards)
  async loginPage(@Res() res: Response) {
    // Login page deactivated as requested by the customer.
    // res.render('login');
    res.redirect((await this.idpService.getOpenIdSigninRedirectUrl()).url);
    return;
  }

  @Get('validate-request')
  @ApiOperation({ summary: 'Validate user request' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 200, description: 'Request is validated' })
  async validateRequest(@Req() req: Request, @Res() res: Response) {
    let token = req.cookies[this.configService.authCookieName] as string | undefined;
    if (!token) {
      token = req.header('authorization')?.substring(7);
    }

    const valid = token && (await this.jwtService.verifyToken(token));
    if (!valid) {
      if (this.configService.redirectOnValidationFail) {
        return res.redirect(
          urlJoin(this.configService.baseUrl, 'v1', AUTH.PREFIX, AUTH.ROUTES.LOGIN.path),
        );
      } else {
        return res.status(401).send();
      }
    }

    const info: AuthInfo = await this.jwtService.decode(token as string);
    return res.status(200).send(info);
  }

  @Get('acs')
  async acsGet(@Req() req: Request, @Res() res: Response, @Query('mode') mode: string) {
    await this.handleAcs(req, res, mode || null);
  }

  @Post('acs')
  async acsPost(@Req() req: Request, @Res() res: Response, @Query('mode') mode: string) {
    await this.handleAcs(req, res, mode || null);
  }

  @Post('tenant/:tenantId')
  @ApiOperation({ summary: 'Switch tenant by id' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 200, description: 'Tenant is switched' })
  @ApiParam({ name: 'tenantId', type: String })
  async switchTenant(
    @Req() req: Request,
    @Res() res: Response,
    @Param('tenantId') tenantId: string,
  ) {
    await this.handleSwitchTenant(req, res, tenantId);
  }

  @Post(AUTH.ROUTES.LOGIN.path)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 200, description: 'Log in successfully' })
  @UseGuards(...AUTH.ROUTES.LOGIN.guards)
  @HttpCode(200)
  async login(@Res() res: Response): Promise<DataResponse<TokenDto> | undefined> {
    res.redirect((await this.idpService.getOpenIdSigninRedirectUrl()).url);
    return;
  }

  @Get(AUTH.ROUTES.LOGOUT.path)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 200, description: 'Log out successfully' })
  @UseGuards(...AUTH.ROUTES.LOGOUT.guards)
  @HttpCode(200)
  @ApiBearerAuth()
  async logout(@Res() res: Response): Promise<DataResponse<boolean> | undefined> {
    res.redirect(await this.idpService.getOpenIdSignOutRedirectUrl());
    return;
  }

  @Get(AUTH.ROUTES.ASSERT.path)
  @UseGuards(...AUTH.ROUTES.ASSERT.guards)
  @Redirect()
  async assert(
    @Query(AUTH.ROUTES.ASSERT.query.TOKEN) token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RedirectResponse> {
    if (!(await this.jwtService.verifyInternalToken(token))) {
      throw new ForbiddenException();
    }

    res.cookie(this.configService.authCookieName, token, {
      expires: new Date(Date.now() + this.configService.sessionTime * 1000),
      httpOnly: false,
    });

    return {
      url: this.configService.defaultRedirectUrl,
    };
  }

  private async handleSwitchTenant(req: Request, res: Response, targetTenantId: string) {
    let cookie = req.cookies[this.configService.authCookieName];
    if (!cookie) {
      cookie = req.header('authorization')?.substring(7);
    }

    if (!(await this.jwtService.verifyToken(cookie))) {
      return res.redirect(
        urlJoin(this.configService.baseUrl, 'v1', AUTH.PREFIX, AUTH.ROUTES.LOGIN.path),
      );
    }
    const info: AuthInfo = await this.jwtService.decode(cookie);
    const jwtData: AuthInfo = {
      ...info,
      iat: Date.now(),
      tenantId: targetTenantId,
    };
    delete jwtData.exp;
    const token = await this.jwtService.sign(jwtData);
    if (token) {
      res.clearCookie(this.configService.authCookieName);
      res.cookie(this.configService.authCookieName, token, {
        expires: new Date(Date.now() + this.configService.sessionTime * 1000),
        httpOnly: false,
      });
    }
    const redirectUrl = this.configService.defaultRedirectUrl; // await this.service.getRedirectUrlByAuthResponse( req, ctx ? ctx.tenantId : '' );
    res.send({ url: redirectUrl }); // .redirect(302, redirectUrl);
  }

  private async handleAcs(req: Request, res: Response, mode: string | null) {
    res.clearCookie(RelayStateCookie);

    // Load the request context
    const ctx = this.loadRelayState(req);

    // Check if the current request is a sign-out request
    if (mode && mode === 'sign-out') {
      res.header('Cache-Control', 'no-store');
      if (ctx && ctx.tenantId) {
        // Redirect the user to the correct tenant's logout page
        // const extURL = this.authService.getAuthServiceUrlExt('/signout', ctx.tenantId);
        // extURL.searchParams.set('success', '1');

        // this.logger.debug(`Redirecting user:`, extURL.toString());
        // res.clearCookie(RelayStateCookie).redirect(302, extURL.toString());
        // temp
        res.clearCookie(RelayStateCookie);
        res.clearCookie(this.configService.authCookieName);
        const url = this.configService.defaultRedirectUrl;
        res.redirect(302, url.toString());
      } else {
        // No redirect target for logout available, show the emergency
        // logout page in en only and without redirect link
        // await this.sendSignOutSuccessPage(res);
        res.clearCookie(RelayStateCookie);
        res.clearCookie(this.configService.authCookieName);
        const url = this.configService.defaultRedirectUrl;
        res.redirect(302, url.toString());
      }

      return;
    }

    // Otherwise it is the response for a signin request
    try {
      // await sleep(3500);
      const claims = await this.idpService.verifyOpenIdSigninAndGetClaims(req);
      // console.debug(`Signin flow finished, claims:`, claims);

      const userId = (claims['oid'] as string) || (claims['sub'] as string) || '';
      console.log('id: ' + userId);
      const usr = await this.idpService.getUserById(userId);
      console.log(usr);
      if (usr && usr.tenantId && usr.tenantId === '-') {
        usr.tenantId = '';
      }
      const jwtData: AuthInfo = {
        iat: Date.now(),
        id: userId,
        name:
          (usr?.firstName && usr?.lastName
            ? usr?.firstName + ' ' + usr?.lastName
            : usr?.displayName) || '',
        tenantId: usr?.tenantId || '',
        roles: usr?.roles || [],
        isMultitenant: usr?.tenantId ? false : true,
        userLang: 'en_EN',
      };

      const token = await this.jwtService.sign(jwtData);

      if (token) {
        res.cookie(this.configService.authCookieName, token, {
          expires: new Date(Date.now() + this.configService.sessionTime * 1000),
          httpOnly: false,
        });
      }
      let redirectUrl = this.configService.defaultRedirectUrl; // await this.service.getRedirectUrlByAuthResponse( req, ctx ? ctx.tenantId : '' );
      if (!usr?.tenantId) {
        redirectUrl = this.configService.tenantRedirectUrl;
      }

      res.redirect(302, redirectUrl);
    } catch (ex) {
      // await this.sendErrorPage(res);
      console.log(ex);
      res.send('Login Error: User might be from another tenant.');
    }
  }

  private loadRelayState(req: Request): RelayState | null {
    let state = req.query.relay_state || null;

    if (!state) {
      state = req.query.relayState || null;
    }

    if (typeof req.cookies[RelayStateCookie] !== 'undefined') {
      state = req.cookies[RelayStateCookie];
    }

    if (state) {
      const ctx = this.relayStateTokens.get<RelayState>(`state_${state}`) || null;

      if (ctx) {
        // this.logger.debug(`Loaded context for acs request:`, ctx);
      } else {
        // this.logger.debug(`No context available for acs request`);
      }

      return ctx;
    }

    return null;
  }
}
