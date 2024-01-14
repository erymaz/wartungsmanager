import { CanActivate } from '@nestjs/common';

import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { JwtInternalAuthGuard } from './auth/jwt/jwt-internal-auth.guard';
import { AclResource, AclRight } from './users/acl/acl.const';
import { AllowRightGuard } from './users/allow-right.guard';

export const USERS = {
  PREFIX: 'users',
  USE_GUARDS: [] as CanActivate[],
  ROUTES: {
    GET_ALL: {
      path: '',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.Read, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {},
    },
    GET_ONE: {
      path: ':userId',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.Read, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
      },
    },
    CREATE_ONE: {
      path: '',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.Create, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {},
    },
    UPDATE_ONE: {
      path: ':userId',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.Update, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
      },
    },
    DELETE_ONE: {
      path: ':userId',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.Delete, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
      },
    },
    ATTACH_ROLE: {
      path: ':userId/roles/:roleId',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Acl, AclRight.AddRole, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
        ROLE_ID: 'roleId',
      },
    },
    DETACH_ROLE: {
      path: ':userId/roles/:roleId',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Acl, AclRight.RemoveRole, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
        ROLE_ID: 'roleId',
      },
    },
    SET_FREE_DATA: {
      path: ':userId/freeData/:key',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.SetFreeData, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
        KEY: 'key',
      },
    },
    GET_FREE_DATA: {
      path: ':userId/freeData',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.Read, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
      },
    },
    LOGOUT: {
      path: ':userId/logout',
      guards: [JwtAuthGuard],
      params: {
        USER_ID: 'userId',
      },
    },
    CHANGE_PASSWORD_REQUEST: {
      path: ':userId/change_password',
      guards: [JwtInternalAuthGuard],
      params: {
        USER_ID: 'userId',
      },
    },
    GET_RESET_PASSWORD_REQUEST: {
      path: ':userId/request_password_reset',
      guards: [JwtInternalAuthGuard],
      params: {
        USER_ID: 'userId',
      },
    },
    SEND_RESET_PASSWORD_REQUEST: {
      path: ':userId/request_password_reset',
      guards: [JwtInternalAuthGuard],
      params: {
        USER_ID: 'userId',
      },
    },
    RESET_PASSWORD: {
      path: ':userId/reset_password',
      guards: [
        JwtAuthGuard,
        AllowRightGuard(AclResource.Users, AclRight.ChangePassword, { idKey: 'userId' }),
      ] as CanActivate[],
      params: {
        USER_ID: 'userId',
      },
    },
    // IS_ALLOWED: {
    //   path: ':userId/is_allowed/:resourceId/:rightKey',
    //   guards: [JwtAuthGuard],
    //   params: {
    //     USER_ID: 'userId',
    //     RESOURCE_ID: 'resourceId',
    //     RIGHT_KEY: 'rightKey',
    //   },
    // },
  },
};
export const ROLES = {
  PREFIX: 'roles',
  USE_GUARDS: [],
  ROUTES: {
    GET_ALL: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Read)] as CanActivate[],
    },
    GET_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Read)] as CanActivate[],
    },
    CREATE_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Create)] as CanActivate[],
    },
    UPDATE_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Update)] as CanActivate[],
    },
    DELETE_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Delete)] as CanActivate[],
    },
    ALLOW: {
      path: ':roleId/allow/:resourceId/:rightKey',
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Acl, AclRight.Allow)] as CanActivate[],
      params: {
        ROLE_ID: 'roleId',
        RESOURCE_ID: 'resourceId',
        RIGHT_KEY: 'rightKey',
      },
    },
  },
};
export const ACL = {
  PREFIX: 'acl',
  USE_GUARDS: [],
  ROUTES: {
    GET_ALL: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Read)] as CanActivate[],
    },
    GET_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Read)] as CanActivate[],
    },
    CREATE_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Create)] as CanActivate[],
    },
    UPDATE_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Update)] as CanActivate[],
    },
    DELETE_ONE: {
      guards: [JwtAuthGuard, AllowRightGuard(AclResource.Roles, AclRight.Delete)] as CanActivate[],
    },
  },
};
export const ME = {
  PREFIX: 'me',
  USE_GUARDS: [JwtAuthGuard],
  ROUTES: {
    GET_ME: {
      path: '/',
      guards: [] as CanActivate[],
      params: {},
    },
    GET_RIGHTS_FOR_RESOURCE: {
      path: '/rights/:resourceId',
      guards: [] as CanActivate[],
      params: {
        RESOURCE_ID: 'resourceId',
      },
    },
    GET_RIGHTS: {
      path: '/rights',
      guards: [] as CanActivate[],
      params: {},
    },
    GET_ROLES: {
      path: '/roles',
      guards: [] as CanActivate[],
      params: {},
    },
    RENEW: {
      path: '/renew',
      guards: [] as CanActivate[],
      params: {},
    },
    CHANGE_PASSWORD: {
      path: '/change_password',
      guards: [] as CanActivate[],
      params: {},
    },
    IS_ALLOWED: {
      path: 'is_allowed/:resourceId/:rightKey',
      guards: [] as CanActivate[],
      params: {
        RESOURCE_ID: 'resourceId',
        RIGHT_KEY: 'rightKey',
      },
    },
  },
};
export const AUTH = {
  PREFIX: '/auth',
  USE_GUARDS: [],
  ROUTES: {
    LOGIN: {
      path: 'login',
      guards: [] as CanActivate[],
      params: {},
    },
    LOGOUT: {
      path: 'logout',
      guards: [JwtAuthGuard],
      params: {},
    },
    ASSERT: {
      path: 'assert',
      guards: [],
      params: {},
      query: {
        TOKEN: 'token',
      },
    },
  },
};
