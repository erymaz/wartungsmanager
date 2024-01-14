import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';

@Entity({ name: TABLE_PREFIX + 'general_settings_entity' })
export class GeneralEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 12345 })
  id!: number;

  // @Column()
  // primaryColor!: string;

  // @Column()
  // bgColor!: string;

  // @Column()
  // light!: boolean;

  // @Column()
  // bgImage!: string;

  @Column()
  @ApiProperty({ example: 'primaryColor' })
  key!: string;
  
  @Column()
  @ApiProperty({ example: '#efefef' })
  value!: string;
  
  @Column({ type: 'char', length: 36, nullable: true })
  @Index()
  @ApiProperty({ example: 'tennant' })
  tenantId!: string;
}
