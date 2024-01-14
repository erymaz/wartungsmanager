import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { ACL } from '../../routes';
import { Acl } from './acl.entity';
import { AclService } from './acl.service';
import { PostAclRequestDto, PutAclRequestDto } from './dto/AclDto';

@Crud({
  model: {
    type: Acl,
  },
  params: {
    aclId: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
  routes: {
    exclude: ['createManyBase'],
  },
  dto: {
    create: PostAclRequestDto,
    update: PutAclRequestDto,
    replace: PutAclRequestDto,
  },
})
@Controller(ACL.PREFIX)
@UseGuards(...ACL.USE_GUARDS)
@ApiBearerAuth()
@ApiTags('ACL Administration')
export class AclController implements CrudController<Acl> {
  constructor(public service: AclService) {}

  @Override('getManyBase')
  @UseGuards(...ACL.ROUTES.GET_ALL.guards)
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<DataResponse<GetManyDefaultResponse<Acl> | Acl[]>> {
    return asResponse(await this.service.getMany(req));
  }

  @Override('getOneBase')
  @UseGuards(...ACL.ROUTES.GET_ONE.guards)
  async getOne(@ParsedRequest() req: CrudRequest): Promise<DataResponse<Acl>> {
    return asResponse(await this.service.getOne(req));
  }

  @Override('createOneBase')
  @UseGuards(...ACL.ROUTES.CREATE_ONE.guards)
  async create(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() { roleId, resourceId, rightKey }: PostAclRequestDto,
  ): Promise<DataResponse<Acl>> {
    return asResponse(await this.service.createOne(req, { roleId, resourceId, rightKey }));
  }

  @Override('updateOneBase')
  @UseGuards(...ACL.ROUTES.UPDATE_ONE.guards)
  async update(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() { roleId, resourceId, rightKey }: PutAclRequestDto,
  ): Promise<DataResponse<Acl>> {
    return asResponse(await this.service.updateOne(req, { roleId, resourceId, rightKey }));
  }

  @Override('replaceOneBase')
  @UseGuards(...ACL.ROUTES.UPDATE_ONE.guards)
  async replace(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() { roleId, resourceId, rightKey }: PutAclRequestDto,
  ): Promise<DataResponse<Acl>> {
    return asResponse(await this.service.replaceOne(req, { roleId, resourceId, rightKey }));
  }

  @Override('deleteOneBase')
  @UseGuards(...ACL.ROUTES.DELETE_ONE.guards)
  async delete(@ParsedRequest() req: CrudRequest): Promise<DataResponse<Acl | void>> {
    return asResponse(await this.service.deleteOne(req));
  }
}
