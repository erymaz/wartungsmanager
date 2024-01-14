import { AuthRoles } from 'shared/common/types';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { Maintenance } from '../entities/maintenance.entity';
import { Filters } from '../task/task.service';
import { MaintenanceService } from './maintenance.service';
import { AllowRoles } from 'shared/nestjs';

@Controller('maintenance')
@ApiTags('Maintenance Controller')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get a single maintenance by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Maintenance with given id not found' })
  @ApiResponse({
    status: 200,
    description: 'The requested maintenance',
    type: Maintenance,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getMaintenance(@Param('id') id: string) {
    return await this.maintenanceService.getMaintenance(id);
  }

  @Get('/by-machine/:id')
  @ApiOperation({ summary: 'Get a single maintenance by Machine id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Maintenance with given id not found' })
  @ApiResponse({
    status: 200,
    description: 'The requested maintenance',
    type: Maintenance,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'filters' })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getMaintenanceByMachine(@Param('id') id: string, @Query() filters: Filters, @Req() request: Request) {
    filters.tenantId = request.auth.tenantId;
    return {
      data: await this.maintenanceService.getMaintenanceByMachine(id, filters),
      summarize: await this.maintenanceService.getSummarizeByMachine(id, request.auth.tenantId),
    };
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all maintenances' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'All maintenances',
    type: Maintenance,
    isArray: true,
  })
  @ApiQuery({ name: 'filters' })
  @ApiQuery({ name: 'machineId' })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getAllMaintenance(
    @Query('filters') filters: string,
    @Query('machineId') machineId: string | string[],
    @Req() request: Request
  ) {
    const tenantId = request.auth.tenantId;
    return {
      data: await this.maintenanceService.getMaintenanceByMachine(
        machineId,
        filters ? { ...JSON.parse(filters), tenantId } : {},
      ),
      summarize: await this.maintenanceService.getSummarizeByMachine(
        machineId,
        tenantId,
      ),
    };
  }

  @Post('/')
  @ApiOperation({ summary: 'Create maintenance' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The maintenance is created',
    type: Maintenance,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async createMaintenance(@Body() body: Maintenance, @Req() request: Request) {
    const tenantId = request.auth.tenantId;
    const result = this.maintenanceService.createMaintenance({ ...body, tenantId });
    return result;
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update maintenance by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The maintenance is udpated',
    type: Maintenance,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async updateMaintenance(@Param('id') id: string, @Body() body: Maintenance) {
    const result = this.maintenanceService.updateMaintenance(id, body);
    return result;
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete maintenance by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance is deleted',
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async deleteMaintenance(@Param('id') id: string) {
    const result = this.maintenanceService.deleteMaintenance(id);
    return result;
  }

  @Put('/complete/:id')
  @ApiOperation({ summary: 'Complete maintenance by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The maintenance is completed',
    type: Maintenance,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async completeMaintenance(@Param('id') id: string) {
    const result = await this.maintenanceService.completeMaintenance(id);
    return result;
  }

  @Get('/machines/:status')
  @ApiOperation({ summary: 'Get all maintenances by status' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The requested maintenances',
    type: Maintenance,
    isArray: true
  })
  @ApiParam({ name: 'status', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getMachinesWithStatus(@Param('status') status: string) {
    const result = await this.maintenanceService.getMachinesWithStatus(status);
    return result;
  }

  @Get('/planned-time/:id')
  @ApiOperation({ summary: 'Get planned time by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The planned time'
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getPlannedTime(@Param('id') id: string) {
    return await this.maintenanceService.getPlannedTime(id);
  }

  @Post('/copy')
  @ApiOperation({ summary: 'Copy maintenance' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The maintenance is copied',
    type: Maintenance
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async copyMaintenance(@Body() body: Maintenance) {
    return await this.maintenanceService.copyMaintenance(body);
  }
}
