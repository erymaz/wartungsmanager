import {
  AssetAliasDto,
  AssetDocumentDto,
  AssetDto,
  MultilangValue,
  UnitedPropertyDto,
} from 'shared/common/models';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { AssetPropertyValueEntity } from '../asset-property/asset-property-value.entity';
import { AssetTypeEntity } from '../asset-type/asset-type.entity';
import { TABLE_PREFIX } from '../definitions';
import { AssetAliasEntity } from './asset-alias.entity';
import { AssetDocumentEntity } from './asset-document.entity';

@Entity({ name: `${TABLE_PREFIX}_asset_entity` })
export class AssetEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'json', nullable: false })
  name!: MultilangValue;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @Column({ type: 'char', length: 36, nullable: true })
  imageId!: string | null;

  @ManyToOne(_ => AssetTypeEntity, assetType => assetType.assets, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  @JoinColumn()
  assetType!: AssetTypeEntity;

  @OneToMany(_ => AssetAliasEntity, alias => alias.asset, { cascade: true })
  aliases!: AssetAliasEntity[];

  @OneToMany(_ => AssetDocumentEntity, alias => alias.asset, { cascade: true })
  documents!: AssetDocumentEntity[];

  @OneToMany(_ => AssetPropertyValueEntity, prop => prop.asset)
  properties!: AssetPropertyValueEntity[];

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  static toExternal(entity: AssetEntity): AssetDto {
    let aliases: AssetAliasDto[] = [];
    if (entity.aliases && entity.aliases.length > 0) {
      aliases = entity.aliases.filter(v => !!v).map(AssetAliasEntity.toExternal);
    }

    let documents: AssetDocumentDto[] = [];
    if (entity.documents && entity.documents.length > 0) {
      documents = entity.documents.filter(v => !!v).map(AssetDocumentEntity.toExternal);
    }

    let properties: UnitedPropertyDto[] = [];
    if (entity.properties && entity.properties.length > 0) {
      properties = entity.properties.filter(v => !!v).map(AssetPropertyValueEntity.toExternal);
    }

    return {
      id: entity.id,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),

      ...(entity.deletedAt
        ? {
            deletedAt: entity.deletedAt.toISOString(),
            isDeleted: true,
          }
        : { isDeleted: false }),

      description: entity.description,
      imageId: entity.imageId || null,
      name: entity.name as MultilangValue,
      ...(entity.assetType ? { assetType: AssetTypeEntity.toExternal(entity.assetType) } : {}),
      documents,
      aliases,
      properties,
    };
  }
}
