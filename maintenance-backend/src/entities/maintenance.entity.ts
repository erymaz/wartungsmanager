import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

import { Task } from './task.entity';
import { Comment } from './comment.entity';
import { File } from './file.entity';
import { Document } from './document.entity';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

@Entity({ name: TABLE_PREFIX + 'maintenances' })
export class Maintenance {
  @ApiResponseProperty()
  @PrimaryColumn({ type: 'varchar', nullable: false })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiResponseProperty()
  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @ApiResponseProperty()
  @CreateDateColumn({ type: 'datetime', nullable: false })
  createdAt!: Date;

  @ApiProperty({default: false})
  @Column({ type: 'boolean', nullable: false, default: false })
  copied!: boolean;
  
  @ApiProperty()
  @Column({ type: 'text', nullable: false })
  machineId!: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: false })
  status!: string;

  @ApiProperty({default: false})
  @Column({ type: 'boolean', nullable: false, default: true })
  isInternal!: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: false })
  title!: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description!: string;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  dueDate!: Date;

  @ApiProperty()
  @Column({ type: 'numeric', nullable: true })
  dueAt!: number;

  @ApiProperty()
  @Column({ type: 'numeric', nullable: true })
  earliestProcessing!: number;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  completedAt!: Date;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  earliestExecTime!: Date;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  category!: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  responsible!: string;

  @ApiProperty()
  @Column({ type: 'numeric', nullable: true })
  interval!: number;

  @ApiProperty({default: 3600, description: `IntervalUnit {
    yearly = 31536000,
    monthly = 2592000,
    weekly = 604800,
    daily = 86400,
    hourly = 3600,
    km = 1000,
    no = 1,
  }`})
  @Column({ type: 'numeric', nullable: true })
  intervalUnit!: number;

  @ApiProperty({default: false})
  @Column({ type: 'boolean', nullable: true })
  completed!: boolean;

  @ApiProperty({default: false})
  @Column({ type: 'boolean', nullable: false, default: false })
  useOperatingHours!: boolean;

  @ApiProperty({default: false})
  @Column({ type: 'boolean', nullable: false, default: false })
  useStrokes!: boolean;

  @ApiProperty({default: false})
  @Column({ type: 'boolean', nullable: false, default: false })
  useDistance!: boolean;

  @OneToMany(
    () => File,
    file => file.maintenance,
  )
  files!: File[];

  @OneToMany(
    () => Task,
    task => task.maintenance,
  )
  tasks!: Task[];

  @OneToMany(
    () => Comment,
    comment => comment.maintenance,
  )
  comments!: Comment[];

  @ManyToMany(
    () => Document,
    document => document.maintenances,
  )
  @JoinTable({
    name: TABLE_PREFIX + 'documents_maintenances',
    joinColumn: {
      name: 'maintenance_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'document_id',
      referencedColumnName: 'id',
    },
  })
  documents!: Document[];

  plannedTime?: number;
  actuallySpendTime?: number;
}

export enum MaintenanceStatus {
  scheduled = 'scheduled',
  dueSoon = 'dueSoon',
  overdue = 'overdue',
  completed = 'completed',
}
