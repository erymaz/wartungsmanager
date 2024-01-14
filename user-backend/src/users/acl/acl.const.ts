export enum AclResource {
  Users = 'users',
  Roles = 'roles',
  Acl = 'acl',
  Global = 'global',
}

export enum AclRight {
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  SetFreeData = 'set_free_data',
  Allow = 'allow',
  AddRole = 'add_role',
  RemoveRole = 'remove_role',
  ChangePassword = 'change-password',
  ChangeUsername = 'change-username',
  ChangeEmail = 'change-email',
  GlobalView = 'global-view',
  GlobalWrite = 'global-write',
}
