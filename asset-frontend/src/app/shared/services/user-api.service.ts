import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

import { DataResponse, User } from '../models';

import { AbstractApiService } from './abstract-api-service.service';

@Injectable({ providedIn: 'root' })
export class UserApiService extends AbstractApiService {
  private users = new Map<string, User>();

  constructor(protected readonly http: HttpClient, protected readonly toastrService: ToastrService) {
    super(environment.userServiceUrl, http, toastrService);
  }

  async getUser(id: string): Promise<User | null> {
    if (this.users.has(id)) {
      return Promise.resolve<User>(this.users.get(id) as User);
    }

    const res = await this.get<DataResponse<User>>(`/v1/users/${id}`);

    if (res.body?.data) {
      this.users.set(id, res.body.data);
      return res.body.data;
    }
    return null;
  }
}
