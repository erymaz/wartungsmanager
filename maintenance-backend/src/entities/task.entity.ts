import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

import { TABLE_PREFIX } from '../definitions';

import { Maintenance } from './maintenance.entity';
import { Comment } from './comment.entity';
import { Document } from './document.entity';

@Entity({ name: TABLE_PREFIX + 'tasks' })
export class Task {
  @ApiResponseProperty()
  @PrimaryColumn({ type: 'varchar', nullable: false })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiResponseProperty()
  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @ApiProperty({default: false})
  @Column({ type: 'boolean' })
  completed!: boolean;

  @ApiProperty({default: null})
  @Column({ type: 'datetime', nullable: true })
  completedDate!: Date | null;

  @ApiProperty()
  @Index({ fulltext: true })
  @Column({ type: 'text' })
  name!: string;

  @ApiProperty({default: true})
  @Column({ type: 'boolean', nullable: false, default: true })
  isInternal!: boolean;

  @ApiProperty()
  @Column({ type: 'text' })
  responsible!: string;

  @ApiProperty()
  @Column({ type: 'numeric' })
  timeUnit!: number;

  @ApiProperty()
  @Column({ type: 'numeric' })
  targetTime!: number;

  @ApiProperty()
  @Column({ type: 'numeric' })
  position!: number;

  @ManyToOne(
    () => Maintenance,
    maintenance => maintenance.tasks,
  )
  maintenance!: Maintenance;

  @OneToMany(
    () => Comment,
    comment => comment.task,
  )
  comments!: Comment[];

  @ManyToMany(
    () => Document,
    document => document.tasks,
  )
  documents!: Document[];
}
