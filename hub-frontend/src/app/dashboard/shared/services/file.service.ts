import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService, DataResponse } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import urlJoin from 'url-join';

const SERVICE_BASE_PATH = urlJoin(environment.fileServiceUrl, 'file');

export interface FileData {
  id: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private api: ApiService) {}

  async uploadFile(file: File): Promise<FileData | undefined> {
    const formData = new FormData();
    formData.append('file', file);
    const fileData: HttpResponse<DataResponse<FileData> | null> = await this.api.post(
      SERVICE_BASE_PATH,
      formData,
    );
    return fileData.body?.data;
  }

  async deleteFile(id: string): Promise<void> {
    await this.api.delete(`${SERVICE_BASE_PATH}/${id}`);
  }
}
