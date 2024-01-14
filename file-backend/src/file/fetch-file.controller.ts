import { AuthRoles } from 'shared/common/types';
import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Response } from 'express-serve-static-core';

import { ConfigService } from '../config/config.service';
import { FileIdParamDto } from './dto/FileIdParamDto';
import { GetImageQueryDto } from './dto/GetImageQueryDto';
import { FileService } from './file.service';
import { AllowRoles } from 'shared/nestjs';

@ApiTags('Fetch File Controller')
@Controller('/v1')
export class FetchFileController {
  constructor(
    @InjectLogger(FetchFileController.name) private readonly logger: LogService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Get('image/:fileId')
  @ApiOperation({ summary: 'Get Image by fileId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Could not get image' })
  @ApiResponse({
    status: 200,
    description: 'File found',
    content: {
      'image/*': {
        example: 'binary',
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'fileId', type: String })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async serveImage(
    @Param() { fileId }: FileIdParamDto,
    @Query() imageOptions: GetImageQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const providedFile = await this.fileService.provideLocalImageFile(fileId, imageOptions);

    res.sendFile(providedFile.localPath, {
      lastModified: true,
      dotfiles: 'deny',
      headers: {
        'Cache-Control': `public, max-age=${this.configService.browserCacheDurationSecs}`,
        'Content-Disposition': `inline`,
        'Content-Type': providedFile.metadata.mime,
      },
      acceptRanges: true,
      cacheControl: true,
    });
  }

  @Get('file/:fileId')
  @ApiOperation({ summary: 'Get File by fileId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Could not get File' })
  @ApiResponse({
    status: 200,
    description: 'File download link',
    content: {
      '*': {
        example: 'binary',
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'fileId', type: String })
  @ApiQuery({
    required: false,
    name: 'disposition',
  })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async serveFile(
    @Param() { fileId }: FileIdParamDto,
    @Query('disposition') disposition: string,
    @Res() res: Response,
  ): Promise<void> {
    const providedFile = await this.fileService.provideLocalFile(fileId);

    res.sendFile(providedFile.localPath, {
      lastModified: true,
      dotfiles: 'deny',
      headers: {
        'Cache-Control': `public, max-age=${this.configService.browserCacheDurationSecs}`,
        ...(disposition === 'inline'
          ? { 'Content-Disposition': `inline` }
          : {
              'Content-Disposition': `attachment; filename="${providedFile.metadata.originalName}"`,
            }),
        'Content-Type': providedFile.metadata.mime,
      },
      acceptRanges: true,
      cacheControl: true,
    });
  }
}
