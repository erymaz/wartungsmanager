import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { Role } from '../role/role.entity';

import moment = require('moment');

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({ name: TABLE_PREFIX + 'acl' })
@Unique('unique', ['roleId', 'resourceId', 'rightKey'])
export class Acl extends BaseEntity {
  @PrimaryColumn({ type: 'char', length: 36, nullable: false })
  @Generated('uuid')
  @ApiProperty({ example: '10ac3aed-4979-4fe8-82d1-c43c7183d446' })
  id!: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ name: 'role_id', type: 'varchar', nullable: false })
  @ApiProperty()
  roleId!: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ name: 'resource_id', type: 'varchar', nullable: false })
  @ApiProperty()
  resourceId!: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ name: 'right_key', type: 'varchar', nullable: false })
  @ApiProperty()
  rightKey!: string;

  @CreateDateColumn({
    type: 'datetime',
    transformer: {
      from: (value: string): string => moment.utc(value).toISOString(),
      to: (value: moment.MomentInput): string =>
        moment.utc(value).format('YYYY-MM-DD HH:mm:ss.SSS'),
    },
  })
  @ApiProperty({ example: new Date().toISOString() })
  createdAt!: string;

  @CreateDateColumn({
    type: 'datetime',
    transformer: {
      from: (value: string): string => moment.utc(value).toISOString(),
      to: (value: moment.MomentInput): string =>
        moment.utc(value).format('YYYY-MM-DD HH:mm:ss.SSS'),
    },
  })
  @ApiProperty({ example: new Date().toISOString() })
  updatedAt!: string;

  @JoinColumn({ name: 'role_id' })
  @OneToOne(() => Role, r => r.acl)
  role!: Role;
}
