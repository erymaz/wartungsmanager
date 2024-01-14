import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

import { TABLE_PREFIX } from '../definitions';

import { Maintenance } from './maintenance.entity';
import { Task } from './task.entity';
import { File } from './file.entity';
import { MaintenanceTask } from './maintenance-task.entity';

@Entity({ name: TABLE_PREFIX + 'documents' })
export class Document {
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

  @ManyToOne(() => File)
  file!: File;

  @ApiProperty()
  @Index({ fulltext: true })
  @Column({ type: 'text', nullable: false })
  title!: string;

  @ApiProperty({default: false})
  @Column({ type: 'boolean', default: false })
  archive!: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: false })
  ext!: string;

  @ManyToMany(
    () => Maintenance,
    maintenance => maintenance.documents,
  )
  maintenances!: Maintenance[];

  @ManyToMany(
    () => Task,
    task => task.documents,
    { cascade: true },
  )
  @JoinTable({
    name: TABLE_PREFIX + 'documents_tasks',
    joinColumn: {
      name: 'document_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
  })
  tasks!: Task[];

  @ManyToOne(() => MaintenanceTask, undefined, { cascade: true })
  @JoinColumn()
  maintenanceTasks!: MaintenanceTask[];
}
