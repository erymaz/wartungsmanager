import { AuthRoles } from 'shared/common/types';
import { Body, Controller, Delete, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { File } from '../entities/file.entity';
import { FileService } from './file.service';
import { AllowRoles } from 'shared/nestjs';

@Controller('file')
@ApiTags('File Controller')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new file' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The file is created',
    type: File,
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async createFile(@Body() data: File, @Req() request: Request) {
    const tenantId = request.auth.tenantId;
    return await this.fileService.createFile({ ...data, tenantId });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete file by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The file is deleted',
  })
  @ApiParam({ name: 'id', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER])
  async deleteFile(@Param('id') id: string) {
    return await this.fileService.deleteFile(id);
  }
}
