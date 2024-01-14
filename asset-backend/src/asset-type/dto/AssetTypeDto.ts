import { ApiProperty } from '@nestjs/swagger';
import {
  AssetDto,
  ISA95EquipmentHierarchyModelElement,
  MultilangValue,
} from 'shared/common/models';

import { AssetClassDto } from '../../asset/dto/AssetDto';

export interface AssetTypeDto {
  id: string;
  isBuiltIn: boolean;
  name: MultilangValue;
  description: string | null;
  extendsType: AssetTypeDto | null;
  equipmentType: ISA95EquipmentHierarchyModelElement;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
  assets?: AssetDto[];
}

export class AssetTypeClassDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  isBuiltIn!: boolean;

  @ApiProperty()
  name!: MultilangValue;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  extendsType!: AssetTypeDto | null;

  @ApiProperty()
  equipmentType!: ISA95EquipmentHierarchyModelElement;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  deletedAt!: string;

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty({ type: () => [AssetClassDto] })
  assets!: AssetDto[];
}
