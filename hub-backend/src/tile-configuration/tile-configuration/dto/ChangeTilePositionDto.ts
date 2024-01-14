import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class ChangeTilePositionDto {
  @ApiProperty()
  fromId!: number;

  @ApiProperty()
  toId!: number;
}

export const ChangeTilePositionDtoSchema = Joi.object().keys({
  fromId: Joi.number(),
  toId: Joi.number(),
});
