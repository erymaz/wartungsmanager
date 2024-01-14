import { AuthRoles } from 'shared/common/types';
import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { AllowRoles, asResponse, DataResponse, getResponseFor } from 'shared/nestjs';

import { ChangeTilePositionDto } from './dto/ChangeTilePositionDto';
import {
  PostTileConfigurationDto,
  PostTileConfigurationDtoSchema,
} from './dto/PostTileConfiguration';
import { TileConfigurationEntity } from './tile-configuration.entity';
import { TileConfigurationService } from './tile-configuration.service';

@Controller('tile-configuration')
export class TileConfigurationController {
  constructor(private readonly tileConfigurationService: TileConfigurationService) {}

  @Get('')
  @ApiOperation({ summary: 'Get the tile configuration' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getTileConfiguration(
    @Req() req: Request,
  ): Promise<DataResponse<TileConfigurationEntity[]>> {
    const tileConfiguration = await this.tileConfigurationService.getTileConfigurations(req.auth);
    return asResponse(tileConfiguration);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a tile configuration' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  @AllowRoles([AuthRoles.SCHULER_ADMIN])
  async postTileConfiguration(
    @Req() req: Request,
    @Body(new JoiPipe(PostTileConfigurationDtoSchema))
    tileConfigurationsDto: PostTileConfigurationDto,
  ): Promise<DataResponse<TileConfigurationEntity>> {
    const tileConfiguration = await this.tileConfigurationService.createTileConfiguration(
      req.auth,
      {
        tileName: tileConfigurationsDto.tileName,
        desc: tileConfigurationsDto.desc,
        appUrl: tileConfigurationsDto.appUrl,
        iconUrl: tileConfigurationsDto.iconUrl,
        tileColor: tileConfigurationsDto.tileColor,
        tileTextColor: tileConfigurationsDto.tileTextColor,
        order: tileConfigurationsDto.order,
      },
    );

    return asResponse(tileConfiguration);
  }

  @Put('/change-position')
  @ApiOperation({ summary: 'Change the tile position' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  @AllowRoles([AuthRoles.SCHULER_ADMIN])
  async changePositionGeneralSetting(
    @Req() req: Request,
    @Body()
    { fromId, toId }: ChangeTilePositionDto,
  ): Promise<DataResponse<TileConfigurationEntity>> {
    const tileConfigurations = await this.tileConfigurationService.changePosition(
      req.auth,
      fromId,
      toId,
    );

    return asResponse(tileConfigurations);
  }

  @Put('/:tileConfigurationId')
  @ApiOperation({ summary: 'Update the tile configuration' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  @ApiParam({ name: 'tileConfigurationId', type: Number })
  @AllowRoles([AuthRoles.SCHULER_ADMIN])
  async putGeneralSetting(
    @Req() req: Request,
    @Param('tileConfigurationId')
    tileConfigurationId: number,
    @Body(new JoiPipe(PostTileConfigurationDtoSchema))
    tileConfigurationsDto: PostTileConfigurationDto,
  ): Promise<DataResponse<TileConfigurationEntity>> {
    const tileConfigurations = await this.tileConfigurationService.updateTileConfiguration(
      req.auth,
      tileConfigurationId,
      tileConfigurationsDto,
    );

    return asResponse(tileConfigurations);
  }

  @Delete('/:tileConfigurationId')
  @ApiOperation({ summary: 'Delete a tile configuration' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ type: getResponseFor(TileConfigurationEntity) })
  @ApiParam({ name: 'tileConfigurationId', type: Number })
  @AllowRoles([AuthRoles.SCHULER_ADMIN])
  async deletePositionGeneralSetting(
    @Req() req: Request,
    @Param('tileConfigurationId')
    tileConfigurationId: number,
  ): Promise<DataResponse<boolean>> {
    const tileConfigurations = await this.tileConfigurationService.deleteTileConfiguration(
      req.auth,
      tileConfigurationId,
    );

    return asResponse(tileConfigurations);
  }
}
