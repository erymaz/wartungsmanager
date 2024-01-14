import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

import { TABLE_PREFIX } from '../definitions';

import { Maintenance } from './maintenance.entity';
import { Task } from './task.entity';

@Entity({ name: TABLE_PREFIX + 'comments' })
export class Comment {
  @ApiResponseProperty()
  @PrimaryColumn({ type: 'varchar', nullable: false })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiResponseProperty()
  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @ApiProperty()
  @Column({ type: 'numeric', nullable: false })
  duration!: number;

  @ApiProperty({default: 1})
  @Column({ type: 'numeric', nullable: false, default: 1 })
  timeUnit!: number;

  @ApiProperty({default: null})
  @Column({ type: 'text', nullable: true })
  responsible!: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: false })
  comment!: string;

  @ManyToOne(
    () => Maintenance,
    maintenance => maintenance.comments,
  )
  maintenance!: Maintenance;

  @ManyToOne(
    () => Task,
    task => task.comments,
  )
  task!: Task;
}
