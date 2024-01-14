import { AuthRoles } from 'shared/common/types';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { AllowRoles, asResponse, DataResponse, getResponseFor } from 'shared/nestjs';

import { PostGeneralSettingsDto, PutGeneralSettingsDtoSchema } from './dto/PostGeneralSettingsDto';
import { GeneralEntity } from './general.entity';
import { GeneralService } from './general.service';

@Controller('general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Get('')
  @ApiOperation({ summary: 'Get the general setting' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ type: getResponseFor(GeneralEntity) })
  @AllowRoles([AuthRoles.SCHULER_ADMIN, AuthRoles.CUSTOMER_MAINTENANCE_MANAGER, AuthRoles.MAINTENANCE_PERSONELL])
  async getGeneralSetting(@Req() req: Request): Promise<DataResponse<GeneralEntity[]>> {
    let generalSettings = await this.generalService.getGeneralSettings(req.auth);
    if (!generalSettings || generalSettings.length === 0) {
      generalSettings = await this.generalService.createGeneralSetting(req.auth, [
        {
          key: 'primaryColor',
          value: '#B60025',
        },
        {
          key: 'bgColor',
          value: '#efefef',
        },
        {
          key: 'light',
          value: 'false',
        },
        {
          key: 'bgImage',
          value: '',
        },
      ]);
    }

    return asResponse(generalSettings);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a general setting' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid/missing param' })
  @ApiResponse({ type: getResponseFor(GeneralEntity) })
  @ApiBody({ isArray: true, required: true, type: PostGeneralSettingsDto })
  @AllowRoles([AuthRoles.SCHULER_ADMIN])
  async postGeneralSetting(
    @Req() req: Request,
    @Body(new JoiPipe(PutGeneralSettingsDtoSchema)) generalSettingsDto: PostGeneralSettingsDto[],
  ): Promise<DataResponse<GeneralEntity[]>> {
    const generalSettings = await this.generalService.createGeneralSetting(
      req.auth,
      generalSettingsDto,
    );
    return asResponse(generalSettings);
  }

  // @Put('/:generalSettingId')
  // @ApiResponse({ type: getResponseFor(GeneralEntity) })
  // async putGeneralSetting(
  //     @Param('generalSettingId' ) generalSettingId: number,
  //     @Body(new JoiPipe(PostGeneralSettingsDtoSchema)) generalSettingsDto: PostGeneralSettingsDto[],
  // ): Promise<DataResponse<GeneralEntity[]>> {
  //     const generalSettings = await this.generalService.updateGeneralSetting(generalSettingsDto);

  //     return asResponse(generalSettings);
  // }
}
