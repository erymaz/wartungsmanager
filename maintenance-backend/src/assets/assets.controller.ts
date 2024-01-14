import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AssetsService } from './assets.service';
import { AuthRoles } from 'shared/common/types';
import { AllowRoles } from 'shared/nestjs';

@Controller('assets')
@ApiTags('Assets Controller')
export class AssetsController {
  constructor(private readonly assetService: AssetsService) {}

  @Get('/tree')
  @ApiOperation({ summary: 'Get tree' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Assets are provided'
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getTree(@Req() req: Request) {
    const tree = await this.assetService.getTree(req.auth);
    return { meta: {}, data: tree };
  }

  @Get('/machines')
  @ApiOperation({ summary: 'Get machines' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Assets are provided'
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getMachines(@Req() req: Request) {
    const machines = await this.assetService.getMachines(req.auth);
    return {
      meta: {},
      data: machines,
    };
  }

  @Post('/operating-hours')
  @ApiOperation({ summary: 'Set operating hours' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Operating hours are setted'
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async setOperatingHours(@Body() body: { value: string; assetId: string }, @Req() req: Request) {
    const result = await this.assetService.setOperatingHours(body.assetId, body.value, req.auth);
    return {
      meta: {},
      data: result,
    };
  }
}
