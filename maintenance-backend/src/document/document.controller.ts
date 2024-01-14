import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthRoles } from 'shared/common/types';
import { AllowRoles } from 'shared/nestjs';

import { Document } from '../entities/document.entity';
import { Filters } from '../task/task.service';
import { DocumentService } from './document.service';

@Controller('document')
@ApiTags('Document Controller')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The document is provided',
    type: Document,
    isArray: true,
  })
  @ApiQuery({ name: 'filters' })
  @AllowRoles([
    AuthRoles.SCHULER_ADMIN,
    AuthRoles.CUSTOMER_MAINTENANCE_MANAGER,
    AuthRoles.MAINTENANCE_PERSONELL,
  ])
  async getDocuments(@Query() filters: Filters, @Req() request: Request) {
    filters.tenantId = request.auth.tenantId;
    return await this.documentService.getDocuments(filters);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Maintenance with given ID not found' })
  @ApiResponse({
    status: 200,
    description: 'The document is created',
    type: Document,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async createDocument(@Body() data: Document, @Req() request: Request) {
    const tenantId = request.auth.tenantId;
    return await this.documentService.createDocument({ ...data, tenantId });
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update document by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Maintenance with given ID not found' })
  @ApiResponse({
    status: 200,
    description: 'The document is updated',
    type: Document,
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([
    AuthRoles.SCHULER_ADMIN,
    AuthRoles.CUSTOMER_MAINTENANCE_MANAGER,
    AuthRoles.MAINTENANCE_PERSONELL,
  ])
  async updateDocument(@Param('id') id: string, @Body() data: Document) {
    return await this.documentService.updateDocument(id, data);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a document by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Document with given ID not found' })
  @ApiResponse({
    status: 200,
    description: 'The document is deleted',
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async deleteDocument(@Param('id') id: string) {
    return await this.documentService.deleteDocument(id);
  }
}
