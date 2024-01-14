import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FileResponse } from 'shared/common/types/files';
import { environment } from 'src/environments/environment';

import { DataResponse } from '../models';

import { AbstractApiService } from './abstract-api-service.service';

@Injectable({ providedIn: 'root' })
export class FileApiService extends AbstractApiService {
  constructor(protected readonly http: HttpClient, protected readonly toastrService: ToastrService) {
    super(environment.fileServiceUrl, http, toastrService);
  }

  async uploadFile(file: File): Promise<FileResponse | null> {
    const data = new FormData();
    data.append('file', file, file.name);

    const res = await this.post<DataResponse<FileResponse>>('/v1/file', data);
    return res.body?.data || null;
  }
}
