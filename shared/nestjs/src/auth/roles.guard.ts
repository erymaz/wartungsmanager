import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRoles } from 'shared/common/types';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './allow-roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const handler = context.getHandler();
    const req = context.switchToHttp().getRequest() as Request;

    const routeRoles = this.reflector.get<AuthRoles[] | undefined>(ROLES_KEY, handler);

    if (!routeRoles && req.auth.__isInternal) {
      return true;
    }

    if (Array.isArray(routeRoles) && routeRoles.some(role => req.auth.roles.includes(role))) {
      return true;
    }

    return false;
  }
}
