/* eslint @typescript-eslint/no-use-before-define: 0 */
/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */

import { AuthRoles } from 'shared/common/types';
import { Body, ConflictException, Controller, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { AssetTypeDto } from 'shared/common/models';
import {
  AllowRoles,
  ApiPaginationMeta,
  asResponse,
  DataResponse,
  getDataResponseForCrudMany,
  TenantIdAutoFilter,
} from 'shared/nestjs';

import { AssetService } from '../asset/asset.service';
import {
  ENDPOINT_QUERY_CACHE_TIME,
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../definitions';
import { AssetTypeEntity } from './asset-type.entity';
import { AssetTypeService } from './asset-type.service';
import { AssetTypeClassDto } from './dto/AssetTypeDto';
import { CreateAssetTypeClassDto, CreateAssetTypeSchema } from './dto/CreateAssetTypeDto';
import { UpdateAssetTypeClassDto, UpdateAssetTypeSchema } from './dto/UpdateAssetTypeDto';

@Crud({
  model: {
    type: AssetTypeEntity,
  },
  query: {
    alwaysPaginate: true,
    limit: ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
    maxLimit: ENDPOINT_RESULT_QUERY_LIMIT,
    cache: ENDPOINT_QUERY_CACHE_TIME,
    filter: {
      deletedAt: {
        $isnull: '',
      },
    },
    join: {
      extendsType: {
        exclude: ['tenantId'],
        eager: true,
      },
    },
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  validation: false,
  routes: {
    only: ['createOneBase', 'getManyBase', 'getOneBase', 'updateOneBase', 'deleteOneBase'],
  },
})
@Controller('asset-types')
@ApiTags('Asset Type Controller')
@TenantIdAutoFilter()
export class AssetTypeController implements CrudController<AssetTypeEntity> {
  constructor(public service: AssetTypeService, private readonly assetService: AssetService) {}

  get base(): CrudController<AssetTypeEntity> {
    return this;
  }

  @Override()
  @ApiOperation({ summary: 'Create Asset Type' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 201,
    description: 'The Asset Type is created',
    type: AssetTypeClassDto,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async createOne(
    @Body(new JoiPipe(CreateAssetTypeSchema)) dto: CreateAssetTypeClassDto,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<AssetTypeDto>> {
    const ret = await this.service.createAssetType(rawRequest.auth, dto);
    return asResponse(AssetTypeEntity.toExternal(ret));
  }

  @Override()
  @ApiOperation({ summary: 'Get list of Asset Types' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'The List is provided',
    type: AssetTypeClassDto,
    isArray: true,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getMany(
    @ParsedRequest() req: CrudRequest,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<AssetTypeDto[], ApiPaginationMeta>> {
    // Make sure, that for the requested tenant the default
    // asset types are existing
    await this.service.ensureDefaultAssetTypesForTenant(rawRequest.auth);

    // Continue and load the data as requested
    const ret = await this.base.getManyBase!(req);
    return getDataResponseForCrudMany<AssetTypeEntity, AssetTypeDto>(
      ret,
      AssetTypeEntity.toExternal,
    );
  }

  @Override()
  @ApiOperation({ summary: 'Get Asset Type by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The Asset Type is provided',
    type: AssetTypeClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getOne(
    @ParsedRequest() req: CrudRequest,
    @Req() rawRequest: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<AssetTypeDto>> {
    const result = await this.base.getOneBase!(req);

    // Add also a list of assets
    result.assets = await this.assetService.getAssetsByTypeId(rawRequest.auth, id);
    return asResponse(AssetTypeEntity.toExternal(result));
  }

  @Override()
  @ApiOperation({ summary: 'Update Asset Type by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 200,
    description: 'The Asset Type is updated',
    type: AssetTypeClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async updateOne(
    @Body(new JoiPipe(UpdateAssetTypeSchema)) dto: UpdateAssetTypeClassDto,
    @Param('id') id: string,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<AssetTypeDto>> {
    const result = await this.service.updateAssetType(rawRequest.auth, id, dto);
    return asResponse(AssetTypeEntity.toExternal(result));
  }

  @Override()
  @ApiOperation({ summary: 'Delete Asset Type by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The Asset Type is delete',
    type: Boolean,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async deleteOne(@Param('id') id: string, @Req() rawRequest: Request): Promise<void> {
    // Check if the asset type is built-in and therefore cannot
    // be deleted
    const isBuiltIn = await this.service.isBuiltInByIdOrFail(rawRequest.auth, id);
    if (isBuiltIn) {
      throw new ConflictException(`Cannot delete a built-in asset type!`);
    }

    // Perform the actual action of soft-deleting the asset type
    await this.service.softDeleteById(rawRequest.auth, id);
  }
}
