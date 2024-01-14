import { AuthRoles } from 'shared/common/types';
import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { Comment } from '../entities/comment.entity';
import { CommentService } from './comment.service';
import { AllowRoles } from 'shared/nestjs';

@Controller('comment')
@ApiTags('Comments Controller')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('/maintenance')
  @ApiOperation({ summary: 'Create a new comment for maintenance' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The comment for maintenance is created',
    type: Comment
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async createMaintenanceComment(@Body() body: Comment, @Req() request: Request) {
    const tenantId = request.auth.tenantId;
    return await this.commentService.createComment({ ...body, tenantId });
  }

  @Post('/task')
  @ApiOperation({ summary: 'Create a new comment for task' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Maintenance with given ID not found' })
  @ApiResponse({
    status: 200,
    description: 'The comment for task is created',
    type: Comment,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async createTaskComment(@Body() body: Comment, @Req() request: Request) {
    const tenantId = request.auth.tenantId;
    return await this.commentService.createComment({ ...body, tenantId });
  }

  @Get('/maintenance/:id')
  @ApiOperation({ summary: 'Get comment by maintenance id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Maintenance with given ID not found' })
  @ApiResponse({
    status: 200,
    description: 'The comment for maintenance is provided',
    type: Comment,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getCommentByMaintenance(@Param('id') id: string) {
    return await this.commentService.getCommentByMaintenance(id);
  }

  @Put('/update')
  @ApiOperation({ summary: 'Update comment' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Maintenance with given ID not found' })
  @ApiResponse({
    status: 200,
    description: 'The comment is updated',
    type: Comment,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async updateComment(@Body() data: Comment) {
    return this.commentService.updateComment(data);
  }
}
