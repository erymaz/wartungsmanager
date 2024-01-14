import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { User } from '../../users/user/user.entity';

@Entity({ name: TABLE_PREFIX + 'logouts' })
export class Logout extends BaseEntity {
  @PrimaryColumn({ type: 'char', length: 36, nullable: false })
  @Generated('uuid')
  @ApiProperty({ example: '10ac3aed-4979-4fe8-82d1-c43c7183d446' })
  id!: string;

  @IsNotEmpty()
  @IsString({ always: true })
  @Column({ type: 'char', nullable: false, unique: true })
  @OneToOne(() => User)
  @ApiProperty()
  userId!: string;

  @CreateDateColumn({
    type: 'datetime',
  })
  @ApiProperty({ example: new Date().toISOString() })
  date!: string;
}
