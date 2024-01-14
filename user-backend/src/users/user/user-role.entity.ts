import { BaseEntity, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';
import { Role } from '../role/role.entity';

@Entity({ name: TABLE_PREFIX + 'users_roles' })
export class UserRole extends BaseEntity {
  @PrimaryColumn({ type: 'char', length: 36, nullable: false })
  @Generated('uuid')
  userId!: string;

  @PrimaryColumn({ type: 'char', length: 36, nullable: false })
  @Generated('uuid')
  roleId!: string;

  @ManyToOne(() => Role, role => role.usersConnection, {
    primary: true,
  })
  @JoinColumn({ name: 'role_id' })
  role!: Role;
}
