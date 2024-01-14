import { Command } from 'nestjs-command';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

import { UserRole } from '../../src/users/user/user-role.entity';
import { User } from '../../src/users/user/user.entity';
import { Role } from '../../src/users/role/role.entity';
import { Acl } from '../../src/users/acl/acl.entity';
import { AclResource, AclRight } from '../../src/users/acl/acl.const';
import { ConfigService } from '../../src/config/config.service';

@Injectable()
export class AclSeedCommand {
  constructor(
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserRole) private userRolesRepo: Repository<UserRole>,
    @InjectRepository(Acl) private aclRepo: Repository<Acl>,
    @Inject(ConfigService) private configService: ConfigService,
  ) { }

  @Command({
    command: 'seed:dev',
    describe: 'seed database',
    autoExit: true,
  })
  async seedDev() {
    let adminRole = (await this.rolesRepo
      .find({ where: { name: 'Admin' }, select: ['id'] })
      .then(([data]) => data)) as Partial<{ id: string }>;
    let customer = (await this.rolesRepo
      .find({ where: { name: 'Admin' }, select: ['id'] })
      .then(([data]) => data)) as Partial<{ id: string }>;

    if (!customer) {
      const role2 = this.rolesRepo.create({
        name: 'Customer',
        description: 'Customer role',
      });

      await this.rolesRepo.insert(role2);
    }
    if (!adminRole) {
      const role = this.rolesRepo.create({
        name: 'Admin',
        description: 'Admin role',
      });
    


    const roleFromDb = await this.rolesRepo.insert(role);
    adminRole = { id: roleFromDb.identifiers[0].id };

    for (const resourceId of Object.values(AclResource)) {
      for (const rightKey of Object.values(AclRight)) {
        await this.aclRepo.insert({
          roleId: adminRole.id,
          resourceId,
          rightKey,
        });
      }
    }
  }

    let adminUser = (await this.usersRepo
  .find({ where: { name: this.configService.admin.username }, select: ['id'] })
  .then(([data]) => data)) as Partial<{ id: string }>;

if (!adminUser) {
  const user = this.usersRepo.create({
    name: this.configService.admin.username,
    email: this.configService.admin.email,
    password: this.configService.admin.password,
  });

  const userFromDb = await this.usersRepo.insert(user);

  adminUser = { id: userFromDb.identifiers[0].id };
}

const adminUserRoles = await this.userRolesRepo.find({
  where: { userId: adminUser.id, roleId: adminRole.id },
});

if (!adminUserRoles.length) {
  const userRole = this.userRolesRepo.create({
    userId: adminUser.id,
    roleId: adminRole.id,
  });

  await this.userRolesRepo.insert(userRole);
}

// eslint-disable-next-line no-console
console.log('Acl Database Seeding has been ended successfully!');
  }

@Command({
  command: 'seed:prod',
  describe: 'seed database',
  autoExit: true,
})
async seedProd() {
  let adminRole = (await this.rolesRepo
    .find({ where: { name: 'Admin' }, select: ['id'] })
    .then(([data]) => data)) as Partial<{ id: string }>;

  if (!adminRole) {
    const role = this.rolesRepo.create({
      name: 'Admin',
      description: 'Admin role',
    });

    const roleFromDb = await this.rolesRepo.insert(role);

    adminRole = { id: roleFromDb.identifiers[0].id };

    for (const resourceId of Object.values(AclResource)) {
      for (const rightKey of Object.values(AclRight)) {
        await this.aclRepo.insert({
          roleId: adminRole.id,
          resourceId,
          rightKey,
        });
      }
    }
  }

  let adminUser = (await this.usersRepo
    .find({ where: { name: this.configService.admin.username }, select: ['id'] })
    .then(([data]) => data)) as Partial<{ id: string }>;

  if (!adminUser) {
    const password = randomStringGenerator();

    const user = this.usersRepo.create({
      name: this.configService.admin.username,
      email: this.configService.admin.email,
      password,
    });

    // eslint-disable-next-line no-console
    console.log('Admin password is: ', password);
    // eslint-disable-next-line no-console
    console.log("Don't forget to CHANGE IT!");

    const userFromDb = await this.usersRepo.insert(user);

    adminUser = { id: userFromDb.identifiers[0].id };
  }

  const adminUserRoles = await this.userRolesRepo.find({
    where: { userId: adminUser.id, roleId: adminRole.id },
  });

  if (!adminUserRoles.length) {
    const userRole = this.userRolesRepo.create({
      userId: adminUser.id,
      roleId: adminRole.id,
    });

    await this.userRolesRepo.insert(userRole);
  }

  // eslint-disable-next-line no-console
  console.log('Acl Database Seeding has been ended successfully!');
}
}
