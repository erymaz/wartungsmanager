import { AuthRoles } from 'shared/common/types';

export interface UserAdapterObject {
  id: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  email: string;
  roles: AuthRoles[];
  displayName: string | null;
  preferredLanguage: string;
  tenantId: string;
  identities: UserAdapterIdentityObject[];
  isSuperuser?: boolean;
}

export interface UserAdapterIdentityObject {
  type: 'emailAddress' | 'userName' | 'userPrincipalName';
  value: string;
}
