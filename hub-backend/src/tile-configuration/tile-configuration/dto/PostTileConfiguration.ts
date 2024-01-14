import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class PostTileConfigurationDto {
  @ApiProperty()
  tileName!: string;

  @ApiProperty()
  desc!: string;

  @ApiProperty()
  appUrl!: string;

  @ApiProperty()
  iconUrl!: string;

  @ApiProperty()
  tileColor!: string;

  @ApiProperty()
  tileTextColor!: string;

  @ApiProperty()
  order!: number;
}

export const PostTileConfigurationDtoSchema = Joi.object().keys({
  tileName: Joi.string(),
  desc: Joi.string(),
  appUrl: Joi.string(),
  iconUrl: Joi.string(),
  tileColor: Joi.string(),
  tileTextColor: Joi.string(),
  order: Joi.number(),
});
