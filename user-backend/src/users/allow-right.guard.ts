import { CanActivate, ExecutionContext, Inject, mixin } from '@nestjs/common';
import { Request } from 'express';

import { JwtUserDto } from '../auth/auth/dto/JwtUserDto';
import { AuthHelper } from '../auth/jwt/auth.helper';
import { AclResource, AclRight } from './acl/acl.const';
import { AclService } from './acl/acl.service';

export const AllowRightGuard = (
  resourceId: AclResource,
  rightKey: AclRight,
  allowSelf?: { idKey: string },
): unknown => {
  class AllowRightMixin implements CanActivate {
    constructor(
      @Inject('AclService') private readonly aclService: AclService,
      @Inject('AuthHelper') private readonly authHelper: AuthHelper,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user as JwtUserDto;
      return true;
      // if (!user) {
      //   return true;
      // }

      // if (this.authHelper.isSuperAdmin(user)) {
      //   return true;
      // }

      // return this.aclService.checkRights(
      //   allowSelf ? request.params[allowSelf.idKey] : null,
      //   user.id,
      //   resourceId,
      //   rightKey,
      // );
    }
  }

  return mixin(AllowRightMixin);
};
