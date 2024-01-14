import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { ApiService, DataResponse } from './api.service';

export interface Tenant {
  id: string;
  name: string;
  updatedAt: string;
  ownerId: string;
  status: boolean;
  url: string;
}
@Injectable({
  providedIn: 'root',
})
export class TenantService {
  constructor(private api: ApiService) {}
  async getCurrentTenant(): Promise<Tenant | undefined> {
    const cookie = this.api.getDfAppSessionCookieContent();
    if (!cookie || !cookie.tenantId) {
      return;
    }
    const tenant: HttpResponse<DataResponse<Tenant> | null> = await this.api.get(
      `${environment.tenantServiceUrl}tenant/${cookie.tenantId}`,
    );
    return tenant.body?.data;
  }
}
