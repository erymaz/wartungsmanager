import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { asResponse, DataResponse } from '../../lib/data-response';
import { AclResource, AclRight } from '../acl/acl.const';
import { Acl } from '../acl/acl.entity';
import { AclService } from '../acl/acl.service';
import { Role } from './role.entity';

@Injectable()
export class RolesService extends TypeOrmCrudService<Role> {
  constructor(
    @InjectRepository(Role) repo: Repository<Role>,
    @InjectRepository(Acl) private aclRepo: Repository<Acl>,
    private readonly aclService: AclService,
  ) {
    super(repo);

    this.initRoles();
  }
  private async initRoles() {
    const customerRole = this.repo.create({
      name: 'Customer',
      description: 'Customer role',
    });
    const adminRole = this.repo.create({
      name: 'Admin',
      description: 'Admin role',
    });
    let currentRoles = await this.repo.find();
    if (!currentRoles || currentRoles.length === 0) {
      await this.repo.insert(customerRole);
      await this.repo.insert(adminRole);
      currentRoles = await this.repo.find();
    }

    const dbCustomerRole = currentRoles.find(r => r.name === customerRole.name);
    const dbAdminRole = currentRoles.find(r => r.name === adminRole.name);

    const adminAcl = await this.aclRepo.find({ roleId: dbAdminRole?.id });
    if (dbAdminRole && (!adminAcl || adminAcl.length === 0)) {
      await this.aclRepo.insert({
        roleId: dbAdminRole.id,
        resourceId: AclResource.Global,
        rightKey: AclRight.GlobalView,
      });
      await this.aclRepo.insert({
        roleId: adminRole.id,
        resourceId: AclResource.Global,
        rightKey: AclRight.GlobalWrite,
      });
    }

    const customerAcl = await this.aclRepo.find({ roleId: dbCustomerRole?.id });
    if (dbCustomerRole && (!customerAcl || customerAcl.length === 0)) {
      await this.aclRepo.insert({
        roleId: dbCustomerRole.id,
        resourceId: AclResource.Global,
        rightKey: AclRight.GlobalView,
      });
    }
  }

  async allow(dto: DeepPartial<Acl>): Promise<DataResponse<boolean>> {
    const count = await this.count({ where: { id: dto.roleId } });

    if (count === 0) {
      throw new NotFoundException('Role not found!');
    }

    await this.aclService.create(dto);

    return asResponse(true);
  }
}
