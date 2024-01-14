import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { MultilangValueSchema } from 'shared/backend/models';
import { AssetPropertyType, AssetPropertyValue, MultilangValue } from 'shared/common/models';

export interface CreatePropertyDefReqDto {
  name: MultilangValue;
  key: string;
  type: AssetPropertyType;
  value: AssetPropertyValue | null;
  isHidden: boolean;
  isRequired: boolean;
  position: number;
}

export class CreatePropertyDefReqClassDto {
  @ApiProperty()
  name!: MultilangValue;
  @ApiProperty()
  key!: string;
  @ApiProperty()
  type!: AssetPropertyType;
  @ApiProperty()
  value!: AssetPropertyValue | null;
  @ApiProperty()
  isHidden!: boolean;
  @ApiProperty()
  isRequired!: boolean;
  @ApiProperty()
  position!: number;
}

export const CreatePropertyDefReqSchemaRaw = {
  name: MultilangValueSchema.required(),
  type: Joi.string()
    .allow(...Object.values(AssetPropertyType))
    .required(),
  key: Joi.string()
    .regex(/^[a-zA-Z\-_][a-zA-Z0-9\-_]+$/)
    .required(),
  value: Joi.alternatives(
    Joi.string().isoDate(),
    Joi.number(),
    Joi.boolean(),
    Joi.string().min(1),
    Joi.allow('', null),
  ).required(),
  isHidden: Joi.boolean().default(false).optional(),
  isRequired: Joi.boolean().default(false).optional(),
  position: Joi.number().min(0).default(0).optional(),
};

export const CreatePropertyDefReqSchema = Joi.object(CreatePropertyDefReqSchemaRaw);
