import { AuthRoles } from 'shared/common/types';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { Task } from '../entities/task.entity';
import { AllowRoles } from 'shared/nestjs';
import { TaskService, Filters } from './task.service';

@Controller('task')
@ApiTags('Task Controller')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'All tasks is provided'
  })
  @ApiQuery({ name: 'query' })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getAllTasks(@Query() filters: Filters, @Req() request: Request) {
    filters.tenantId = request.auth.tenantId;
    return await this.taskService.getAllTasks(filters);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a single task by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The requested task',
    type: Task,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getTask(@Param('id') id: string) {
    return await this.taskService.getTask(id);
  }

  @Put('/by-maintenance/:id/position')
  @ApiOperation({ summary: 'Update a position by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The position is updated'
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async updatePosition(
    @Param('id') id: string,
    @Body() body: { prevPosition: number; nextPosition: number },
  ) {
    return await this.taskService.updatePosition(id, body.prevPosition, body.nextPosition);
  }

  @Get('/by-maintenance/:id')
  @ApiOperation({ summary: 'Get a task by maintenance id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The requested task',
    type: Task,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getTasksByMaintenance(@Param('id') id: string) {
    return await this.taskService.getTasksByMaintenance(id);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({
    status: 200,
    description: 'The task is created',
    type: Task,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async createTask(@Body() body: Task, @Req() request: Request) {
    const tenantId = request.auth.tenantId;
    return await this.taskService.createTask({ ...body, tenantId });
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update task by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Task with given id not found' })
  @ApiResponse({
    status: 200,
    description: 'The task is updated',
    type: Task,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async updateTask(@Param('id') id: string, @Body() body: Task) {
    return await this.taskService.updateTask(id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a task by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Task with given ID not found' })
  @ApiResponse({
    status: 200,
    description: 'The task is deleted'
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async deleteTask(@Param('id') id: string) {
    return await this.taskService.deleteTask(id);
  }
}
