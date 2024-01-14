import { Body, Controller, Get, Param, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtUserDto } from '../../auth/auth/dto/JwtUserDto';
import { TokenDto } from '../../auth/auth/dto/LoginDto';
import { JwtAuthService } from '../../auth/jwt/jwt-auth.service';
import { ConfigService } from '../../config/config.service';
import { asResponse, DataResponse } from '../../lib/data-response';
import { ME } from '../../routes';
import { AclResource, AclRight } from '../acl/acl.const';
import { AclService } from '../acl/acl.service';
import { Role } from '../role/role.entity';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller(ME.PREFIX)
@UseGuards(...ME.USE_GUARDS)
@ApiBearerAuth()
@ApiTags('ACL')
export class MeController {
  constructor(
    public service: UsersService,
    public aclService: AclService,
    public jwtAuthService: JwtAuthService,
    public configService: ConfigService,
  ) {}

  @Get(ME.ROUTES.GET_ME.path)
  @ApiOperation({ summary: 'Get a user by auth id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 200, description: 'The user is provided' })
  @UseGuards(...ME.ROUTES.GET_ME.guards)
  async me(@Req() req: Request): Promise<DataResponse<User>> {
    const user = (await this.service.findOne(req.auth.id)) as User;

    return asResponse(user);
  }

  @Get(ME.ROUTES.IS_ALLOWED.path)
  @ApiOperation({ summary: 'Check the user right' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 200, description: 'The user is allowed' })
  @ApiParam({ name: ME.ROUTES.IS_ALLOWED.params.RESOURCE_ID })
  @ApiParam({ name: ME.ROUTES.IS_ALLOWED.params.RIGHT_KEY })
  @UseGuards(...ME.ROUTES.IS_ALLOWED.guards)
  async isAllowed(
    @Req() req: Request,
    @Param('resourceId') resource: AclResource,
    @Param('rightKey') rightKey: AclRight,
  ): Promise<DataResponse<boolean>> {
    const payload = await this.aclService.checkRights(null, req.auth.id, resource, rightKey);

    return asResponse(payload);
  }

  @Get(ME.ROUTES.GET_RIGHTS_FOR_RESOURCE.path)
  @ApiOperation({ summary: 'Get rights for resource' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 200, description: 'The rights are provided' })
  @ApiParam({ name: ME.ROUTES.GET_RIGHTS_FOR_RESOURCE.params.RESOURCE_ID })
  @UseGuards(...ME.ROUTES.GET_RIGHTS_FOR_RESOURCE.guards)
  async getRightsForResource(
    @Req() req: Request,
    @Param(ME.ROUTES.GET_RIGHTS_FOR_RESOURCE.params.RESOURCE_ID) resource: AclResource,
  ): Promise<DataResponse<unknown>> {
    return asResponse(await this.aclService.getRightsForResource(req.auth.id, resource));
  }

  @Get(ME.ROUTES.GET_RIGHTS.path)
  @ApiOperation({ summary: 'Get rights for user' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 200, description: 'The rights are provided' })
  @UseGuards(...ME.ROUTES.GET_RIGHTS.guards)
  async getRights(@Req() req: Request): Promise<DataResponse<unknown>> {
    const auth = req.auth;
    if (auth.isMultitenant) {
      return asResponse({
        [AclResource.Global]: { [AclRight.GlobalView]: true, [AclRight.GlobalWrite]: true },
      });
    }
    return asResponse(await this.aclService.getRights(req.auth.id));
  }

  @Get(ME.ROUTES.GET_ROLES.path)
  @ApiOperation({ summary: 'Get roles for user' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 200, description: 'The roles are provided' })
  @UseGuards(...ME.ROUTES.GET_ROLES.guards)
  async getRoles(@Req() req: Request): Promise<DataResponse<{ roles: Role[] }>> {
    return await this.service.getRoles(req.auth.id);
  }

  @Get(ME.ROUTES.RENEW.path)
  @ApiOperation({ summary: 'Get new token for user' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 200, description: 'The token for user is refreshed' })
  @UseGuards(...ME.ROUTES.RENEW.guards)
  async renew(@Req() req: { user: JwtUserDto }): Promise<DataResponse<TokenDto>> {
    return asResponse({
      token: await this.jwtAuthService.sign(req.user),
    });
  }

  @Put(ME.ROUTES.CHANGE_PASSWORD.path)
  @ApiOperation({ summary: 'Change the user password' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 200, description: 'Password is changed' })
  @UseGuards(...ME.ROUTES.CHANGE_PASSWORD.guards)
  async changePassword(
    @Req() req: Request,
    @Body(new ValidationPipe()) payload: ChangePasswordDto,
  ): Promise<DataResponse<boolean>> {
    const auth = req.auth;
    return await this.service.changePassword(auth, auth.id, payload.password);
  }
}
