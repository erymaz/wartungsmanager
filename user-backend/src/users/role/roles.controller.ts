import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Crud,
  CrudController,
  CrudRequest,
  GetManyDefaultResponse,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';

import { asResponse, DataResponse } from '../../lib/data-response';
import { ROLES } from '../../routes';
import { PostRoleRequestDto, PutRoleRequestDto } from './dto/RoleDto';
import { Role } from './role.entity';
import { RolesService } from './roles.service';

@Crud({
  model: {
    type: Role,
  },
  params: {
    roleId: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
  routes: {
    exclude: ['createManyBase'],
  },
  dto: {
    create: PostRoleRequestDto,
    update: PutRoleRequestDto,
    replace: PutRoleRequestDto,
  },
})
@Controller(ROLES.PREFIX)
@UseGuards(...ROLES.USE_GUARDS)
@ApiBearerAuth()
@ApiTags('Roles Administration')
export class RolesController implements CrudController<Role> {
  constructor(public service: RolesService) {}

  @Override('getManyBase')
  @UseGuards(...ROLES.ROUTES.GET_ALL.guards)
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<DataResponse<GetManyDefaultResponse<Role> | Role[]>> {
    return asResponse(await this.service.getMany(req));
  }

  @Override('getOneBase')
  @UseGuards(...ROLES.ROUTES.GET_ONE.guards)
  async getOne(@ParsedRequest() req: CrudRequest): Promise<DataResponse<Role>> {
    return asResponse(await this.service.getOne(req));
  }

  @Override('createOneBase')
  @UseGuards(...ROLES.ROUTES.CREATE_ONE.guards)
  async create(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() { name, description }: PostRoleRequestDto,
  ): Promise<DataResponse<Role>> {
    return asResponse(await this.service.createOne(req, { name, description }));
  }

  @Override('updateOneBase')
  @UseGuards(...ROLES.ROUTES.UPDATE_ONE.guards)
  async update(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() { name, description }: PutRoleRequestDto,
  ): Promise<DataResponse<Role>> {
    return asResponse(await this.service.updateOne(req, { name, description }));
  }

  @Override('replaceOneBase')
  @UseGuards(...ROLES.ROUTES.UPDATE_ONE.guards)
  async replace(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() { name, description }: PutRoleRequestDto,
  ): Promise<DataResponse<Role>> {
    return asResponse(await this.service.replaceOne(req, { name, description }));
  }

  @Override('deleteOneBase')
  @UseGuards(...ROLES.ROUTES.DELETE_ONE.guards)
  async delete(@ParsedRequest() req: CrudRequest): Promise<DataResponse<Role | void>> {
    return asResponse(await this.service.deleteOne(req));
  }

  @Post(ROLES.ROUTES.ALLOW.path)
  @ApiOperation({ summary: 'Allow the role on resource' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 200, description: 'Role on resource is allowed' })
  @ApiParam({ name: ROLES.ROUTES.ALLOW.params.ROLE_ID })
  @ApiParam({ name: ROLES.ROUTES.ALLOW.params.RESOURCE_ID })
  @ApiParam({ name: ROLES.ROUTES.ALLOW.params.RIGHT_KEY })
  @UseGuards(...ROLES.ROUTES.ALLOW.guards)
  async allow(
    @Param(ROLES.ROUTES.ALLOW.params.ROLE_ID) roleId: string,
    @Param(ROLES.ROUTES.ALLOW.params.RESOURCE_ID) resourceId: string,
    @Param(ROLES.ROUTES.ALLOW.params.RIGHT_KEY) rightKey: string,
  ): Promise<DataResponse<unknown>> {
    return this.service.allow({ roleId, resourceId, rightKey });
  }
}
