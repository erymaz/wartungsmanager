import { MultilangValue } from 'shared/common/models';

import { ISA95EquipmentHierarchyModelElement } from './ISA95';

export interface AssetDto {
  id: string;
  createdAt: string;
  updatedAt: string;

  isDeleted: boolean;
  deletedAt?: string;

  description: string | null;
  imageId: string | null;
  name: MultilangValue;

  aliases?: AssetAliasDto[];
  assetType?: AssetTypeDto;
  documents?: AssetDocumentDto[];
  properties?: UnitedPropertyDto[];
}

export interface AssetAliasDto {
  id: string;
  alias: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
}

export interface AssetDocumentDto {
  id: string;
  documentId: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  documentType: string | null;
}

export enum AssetPropertyType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  FILE = 'FILE',
}
export type AssetPropertyValue = number | string | Date | boolean;

export interface UnitedPropertyDto {
  id: string;
  key: string;
  name: MultilangValue;
  type: string;
  createdAt: string;
  updatedAt: string;

  value: AssetPropertyValue | null;
  position: number | null;
  isHidden: boolean | null;
  isRequired: boolean | null;

  meta: {
    isOverwritten: boolean;
    fieldsOverwritten: string[];
    isForeignAssetType: boolean;
    originAssetType: string;
  };
}

export type CreateUnitedPropertyDto = Omit<UnitedPropertyDto, 'id' | 'createdAt' | 'updatedAt'>;

export interface AssetTreeNodeDto extends AssetDto {
  children: AssetTreeNodeDto[];
}

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

export const DEVICE_PROP_KEY = 'schuler-device-id';
export const CUSTOMER_PROP_KEY = 'schuler-customer-id';
export const OPERATING_HOURS_PROP_KEY = 'schuler-operating-hours';
export const DISTANCE_PROP_KEY = 'schuler-distance';
export const STROKES_PROP_KEY = 'schuler-strokes';
