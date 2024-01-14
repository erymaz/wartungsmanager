import { applyDecorators, SetMetadata } from '@nestjs/common';
import { AuthRoles } from 'shared/common/types';

export const ROLES_KEY = 'requiredRoles';
export const AllowRoles = (roles: AuthRoles[]) => applyDecorators(SetMetadata(ROLES_KEY, roles));
