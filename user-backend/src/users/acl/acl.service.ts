import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DeepPartial, InsertResult, Repository } from 'typeorm';

import { UserRole } from '../user/user-role.entity';
import { AclResource, AclRight } from './acl.const';
import { Acl } from './acl.entity';

@Injectable()
export class AclService extends TypeOrmCrudService<Acl> {
  constructor(
    @InjectRepository(Acl) repo: Repository<Acl>,
    @InjectRepository(UserRole) private readonly userRolesRepo: Repository<UserRole>,
  ) {
    super(repo);
  }

  create(dto: DeepPartial<Acl>): Promise<InsertResult> {
    try {
      return this.repo.insert(dto);
    } catch (_) {
      throw new BadRequestException('This ACL is already in use!');
    }
  }

  async checkRights(
    userIdFromJwt: string | null,
    userId: string,
    resource: AclResource,
    rightKey: AclRight,
  ): Promise<boolean> {
    if (userIdFromJwt === userId) {
      return true;
    }

    const hasAccess = await this.userRolesRepo
      .createQueryBuilder('main')
      .innerJoinAndSelect('main.role', 'role')
      .innerJoinAndSelect('role.acl', 'acl')
      .where('main.user_id = :userId', { userId })
      .andWhere('acl.resourceId = :resource', { resource })
      .andWhere('acl.rightKey = :rightKey', { rightKey })
      .getCount()
      .then(count => count > 0);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return hasAccess;
  }

  async getRights(userId: string): Promise<{ [key: string]: { [key: string]: boolean } }> {
    const userRoles = await this.userRolesRepo
      .createQueryBuilder('main')
      .innerJoinAndSelect('main.role', 'role')
      .innerJoinAndSelect('role.acl', 'acl')
      .where('main.user_id = :userId', { userId })
      .getMany();

    const acls = (await Promise.all(userRoles.map(x => x.role.acl))).flat() as Acl[];

    return acls.reduce((curr, item) => {
      if (!curr[item.resourceId]) {
        curr[item.resourceId] = {};
      }

      curr[item.resourceId][item.rightKey] = true;

      return curr;
    }, {} as { [key: string]: { [key: string]: boolean } });
  }

  async getRightsForResource(
    userId: string,
    resource: AclResource,
  ): Promise<{ [key: string]: boolean }> {
    const userRoles = await this.userRolesRepo
      .createQueryBuilder('main')
      .innerJoinAndSelect('main.role', 'role')
      .innerJoinAndSelect('role.acl', 'acl')
      .where('main.user_id = :userId', { userId })
      .andWhere('acl.resourceId = :resource', { resource })
      .getMany();

    const acls = (await Promise.all(userRoles.map(x => x.role.acl))).flat() as Acl[];

    return acls.reduce((curr, item) => {
      curr[item.rightKey] = true;

      return curr;
    }, {} as { [key: string]: boolean });
  }
}
