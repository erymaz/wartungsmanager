import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';

@Entity({ name: TABLE_PREFIX + 'tile_configuration_entity' })
export class TileConfigurationEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 12345 })
  id!: number;

  @Column()
  @ApiProperty({ example: 'Tilename' })
  tileName!: string;
  
  @Column()
  @ApiProperty({ example: 'Tile Description' })
  desc!: string;
  
  @Column()
  @ApiProperty({ example: 'https://www.frontend.com' })
  appUrl!: string;
  
  @Column()
  @ApiProperty({ example: 'https://www.frontend.com/icon.svg' })
  iconUrl!: string;
  
  @Column()
  @ApiProperty({ example: '#ffffff' })
  tileColor!: string;
  
  @Column()
  @ApiProperty({ example: '#ffffff' })
  tileTextColor!: string;
  
  @Column()
  @ApiProperty({ example: 2 })
  order!: number;
  
  @Column({ type: 'char', length: 36, nullable: true })
  @Index()
  @ApiProperty({ example: 'tennant' })
  tenantId!: string;
}
