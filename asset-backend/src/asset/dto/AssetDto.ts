import { ApiProperty } from '@nestjs/swagger';
import {
  AssetAliasDto,
  AssetDocumentDto,
  AssetTypeDto,
  MultilangValue,
} from 'shared/common/models';

export class AssetDocumentClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  documentId!: string;
  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  createdBy!: string;
  @ApiProperty()
  documentType!: string | null;
}

export class AssetAliasClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  alias!: string;
  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  createdBy!: string;
}

export class AssetClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  isDeleted!: boolean;
  @ApiProperty()
  deletedAt?: string;

  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  imageId!: string | null;
  @ApiProperty()
  name!: MultilangValue;

  @ApiProperty({ type: () => [AssetAliasClassDto] })
  aliases?: AssetAliasDto[];
  @ApiProperty()
  assetType?: AssetTypeDto;
  @ApiProperty({ type: () => [AssetDocumentClassDto] })
  documents?: AssetDocumentDto[];
}
