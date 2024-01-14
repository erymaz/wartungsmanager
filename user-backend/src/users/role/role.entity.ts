import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { Acl } from '../acl/acl.entity';
import { UserRole } from '../user/user-role.entity';

import moment = require('moment');

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({ name: TABLE_PREFIX + 'roles' })
export class Role extends BaseEntity {
  @PrimaryColumn({ type: 'char', length: 36, nullable: false })
  @Generated('uuid')
  @ApiProperty({ example: '10ac3aed-4979-4fe8-82d1-c43c7183d446' })
  id!: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @ApiProperty()
  name!: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ type: 'varchar' })
  @ApiProperty()
  description!: string;

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

  @OneToMany(() => UserRole, ur => ur.role)
  usersConnection!: Promise<UserRole[]>;

  @OneToMany(() => Acl, acl => acl.role)
  acl!: Promise<Acl[]>;
}
