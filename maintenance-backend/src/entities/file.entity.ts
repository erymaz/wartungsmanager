import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

import { TABLE_PREFIX } from '../definitions';

import { Maintenance } from './maintenance.entity';
import { Document } from './document.entity';

@Entity({ name: TABLE_PREFIX + 'files' })
export class File {
  @ApiProperty()
  @PrimaryColumn({ type: 'varchar', nullable: false })
  id!: string;

  @ApiResponseProperty()
  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @ManyToOne(
    () => Maintenance,
    maintenance => maintenance.files,
  )
  maintenance!: Maintenance;
}
