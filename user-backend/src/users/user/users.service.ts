import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { AuthInfo } from 'shared/common/types';
import { FindConditions, Repository } from 'typeorm';

import { TokenDto } from '../../auth/auth/dto/LoginDto';
import { ConfigService } from '../../config/config.service';
import { asResponse, DataResponse } from '../../lib/data-response';
import { IdPServiceAdapter } from '../adapters/abstract-idp-service-adapter';
import { UserAdapterObject } from '../adapters/dto/UserAdapterObject';
import { Role } from '../role/role.entity';
import { RolesService } from '../role/roles.service';
import { CreateUserDto } from './dto/CreateUserDto';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User) repo: Repository<User>,
    private roleService: RolesService,
    private configService: ConfigService,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    @Inject(IdPServiceAdapter) private idpService: IdPServiceAdapter,
  ) {
    super(repo);
  }

  async getAll(authInfo: AuthInfo): Promise<unknown> {
    const usersResponse = await this.idpService.getUsersForTenant(authInfo.tenantId);

    const users = usersResponse.map(user => this.toExternal(user));

    const augmentedUsers = await Promise.all(
      users.map(async user => {
        try {
          const roles = await this.getRoles(user.id);
          if (roles.data.roles.length === 1) {
            return {
              ...user,
              roleId: roles.data.roles[0].id,
              roleName: roles.data.roles[0].name,
            };
          }
          return {
            ...user,
            roles: roles.data.roles,
          };
        } catch (ex) {
          console.log('No role mapping found for user');
        }
        return user;
      }),
    );

    return augmentedUsers;
  }

  async getByIdForTenant(authInfo: AuthInfo, userId: string) {
    const rawUser = await this.idpService.getUserByIdForTenant(userId, authInfo.tenantId);
    let user: any;
    if (rawUser) {
      // const imageId = await this.usersDataRepo.getUserImageId(rawUser.id);
      user = this.toExternal(rawUser);
    }
    try {
      const roles = await this.getRoles(user.id);
      if (roles.data.roles.length === 1) {
        return {
          ...user,
          roleId: roles.data.roles[0].id,
          roleName: roles.data.roles[0].name,
        };
      }
      return {
        ...user,
        roles: roles.data.roles,
      };
    } catch (ex) {
      console.error('No role found for user');
    }

    return user;
  }

  async getById(authInfo: AuthInfo, userId: string) {
    const rawUser = await this.idpService.getUserByIdForTenant(userId, authInfo.tenantId);
    let user: any;
    if (rawUser) {
      // const imageId = await this.usersDataRepo.getUserImageId(rawUser.id);
      user = this.toExternal(rawUser);
    }
    try {
      const roles = await this.getRoles(user.id);
      if (roles.data.roles.length === 1) {
        return {
          ...user,
          roleId: roles.data.roles[0].id,
          roleName: roles.data.roles[0].name,
        };
      }
      return {
        ...user,
        roles: roles.data.roles,
      };
    } catch (ex) {
      console.error('No role found for user');
    }

    return user;
  }

  async create(authInfo: AuthInfo, data: CreateUserDto) {
    const partialUser: Partial<UserAdapterObject> = {
      userName: data.name,
      displayName: data.name,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    try {
      const rawUser = await this.idpService.createUser(
        partialUser,
        authInfo.tenantId,
        data.password,
      );
      await this.repo.save({
        id: rawUser.id || '',
        name: rawUser.userName || '',
        email: rawUser.email,
        password: '-',
      });
      // const imageId: string | null = null;
      // if (data.image) {
      //   await this.usersDataRepo.setUserImageId(rawUser.id, data.image);
      // }
      return this.toExternal(rawUser);
    } catch (ex) {
      console.error(ex);
      throw new InternalServerErrorException(
        ex.message || 'Error while trying to create a new user',
      );
    }
  }

  async updateById(
    authInfo: AuthInfo,
    userId: string,
    data: CreateUserDto,
    options?: { setPassword: boolean; password: string },
  ) {
    const rawUser = await this.idpService.updateUserByIdForTenant(userId, authInfo.tenantId, {
      userName: data.name,
      email: data.email,
      displayName: data.name,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (!rawUser) {
      throw new NotFoundException('User not found');
    }

    // Check if there is a password action to perform
    if (options && options.setPassword) {
      if (!options.password) {
        throw new BadRequestException('Provide also a password when setPassword set');
      }
      await this.idpService.updatePasswordForUser(
        userId,
        authInfo.tenantId,
        Buffer.from(options.password, 'base64').toString(),
      );
    }

    return this.toExternal(rawUser);
  }

  async deleteUserById(authInfo: AuthInfo, userId: string) {
    const user = await this.idpService.getUserByIdForTenant(userId, authInfo.tenantId);

    if (!user) {
      throw new NotFoundException('User not fount');
    }

    await this.idpService.deleteUserByIdForTenant(userId, authInfo.tenantId);
    await this.repo.delete(userId);
  }

  async attachRole(userId: string, roleId: string): Promise<DataResponse<Role>> {
    const user = await this.findOne(userId, { select: ['id'] });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const role = await this.roleService.findOne(roleId, { select: ['id', 'name', 'description'] });

    if (!role) {
      throw new NotFoundException('Role not found!');
    }

    try {
      await this.userRoleRepo.delete({ userId }); // one role only
      await this.userRoleRepo.insert({ userId, roleId });
    } catch (_) {
      throw new BadRequestException('This user already has this role!');
    }

    return asResponse(role);
  }

  async detachRole(userId: string, roleId: string): Promise<DataResponse<Role>> {
    const user = await this.findOne(userId, { select: ['id'] });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const role = await this.roleService.findOne(roleId, { select: ['id', 'name', 'description'] });

    if (!role) {
      throw new NotFoundException('Role not found!');
    }

    const response = await this.userRoleRepo.delete({ userId, roleId } as FindConditions<UserRole>);

    if (response.affected === 0) {
      throw new NotFoundException('This role has not been attached for this user!');
    }

    return asResponse(role);
  }

  async setFreeData(userId: string, key: string, value: unknown): Promise<DataResponse<boolean>> {
    const user = await this.findOne(userId, { select: ['id', 'freeData'] });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    try {
      if (!user.freeData) {
        user.freeData = JSON.stringify({ [key]: value });
      } else {
        user.freeData = JSON.stringify({ ...JSON.parse(user.freeData), [key]: value });
      }

      await user.save();

      return asResponse(true);
    } catch (e) {
      throw new InternalServerErrorException('An error happened, please try again!');
    }
  }

  async getFreeData(userId: string): Promise<DataResponse<Array<{ key: string; value: unknown }>>> {
    const user = await this.findOne(userId, { select: ['id', 'freeData'] });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!user.freeData) {
      return asResponse([]);
    }

    const payload = Object.entries(JSON.parse(user.freeData)).map(([key, value]) => ({
      key,
      value,
    }));

    return asResponse(payload);
  }

  async getRoles(userId: string): Promise<DataResponse<{ roles: Role[] }>> {
    const userRoles = await this.userRoleRepo
      .createQueryBuilder('main')
      .innerJoinAndSelect('main.role', 'role')
      .where('main.user_id = :userId', { userId })
      .getMany();

    return asResponse({
      roles: userRoles.map(ur => ur.role),
    });
  }

  async changePassword(
    authInfo: AuthInfo,
    userId: string,
    password: string,
  ): Promise<DataResponse<boolean>> {
    return asResponse(
      await this.idpService.updatePasswordForUser(userId, authInfo.tenantId, password),
    );
  }

  async getResetPasswordToken(userId: string): Promise<DataResponse<TokenDto>> {
    const user = await this.findOne(userId, { select: ['id', 'resetPasswordToken'] });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return asResponse({ token: user.resetPasswordToken });
  }

  async generateResetPasswordToken(userId: string): Promise<DataResponse<TokenDto>> {
    const user = await this.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    user.resetPasswordToken = randomStringGenerator();

    await user.save();

    return asResponse({ token: user.resetPasswordToken });
  }

  async resetPassword(
    userId: string,
    resetPasswordToken: string,
    password: string,
  ): Promise<DataResponse<boolean>> {
    const user = await this.findOne(userId, { where: { resetPasswordToken } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    user.password = password;
    user.resetPasswordToken = null;

    await user.save();

    return asResponse(true);
  }

  private toExternal(user: UserAdapterObject, imageId?: string | null | undefined) {
    return {
      id: user.id,
      name: user.displayName,
      email: user.email,
      activated: 1,
      image: imageId || null,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
