export interface ApiToken {
  id: string;
  appId: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  tenantId: string;
  secret?: string;
  scopes: string[];

  /**
   * A special permission flag
   */
  grantSuperAdminAccess?: boolean;
}
