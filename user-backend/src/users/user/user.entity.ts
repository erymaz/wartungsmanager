import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
} from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';

import moment = require('moment');

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({ name: TABLE_PREFIX + 'users' })
export class User extends BaseEntity {
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
  @MaxLength(255, { always: true })
  @IsEmail({ require_tld: false }, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  @ApiProperty()
  email!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Column({ type: 'varchar', nullable: false, select: false })
  @ApiProperty()
  password!: string;

  @IsString()
  @Column({ type: 'varchar', nullable: true, select: false })
  @ApiProperty()
  freeData!: string;

  @IsString()
  @Column({ type: 'varchar', nullable: true, select: false })
  @ApiProperty()
  resetPasswordToken!: string | null;

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
