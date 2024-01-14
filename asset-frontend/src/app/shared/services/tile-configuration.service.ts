import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DataResponse } from '../models';
import { environment } from 'src/environments/environment';
import { AbstractApiService } from './abstract-api-service.service';

export interface TileConfiguration {
  tileName: string;
  desc: string;
  appUrl: string;
  iconUrl: string;
  tileColor: string;
  tileTextColor: string;
  id: number;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class TileConfigurationService extends AbstractApiService {
  tileConfiguration = new BehaviorSubject<TileConfiguration[]>([]);

  constructor(protected readonly http: HttpClient, protected readonly toastrService: ToastrService) {
    super(environment.hubServiceUrl, http, toastrService);
  }

  setTileConfigurations(newConfigs: TileConfiguration[]) {
    this.tileConfiguration.next(newConfigs);
  }

  getTileConfigurations(): Observable<TileConfiguration[]> {
    return this.tileConfiguration;
  }

  async getHttpTileConfigurations() {
    const res = await this.get<DataResponse<TileConfiguration[]>>('/tile-configuration', {
      params: {},
    });
    this.setTileConfigurations(res.body?.data || []);
  }

}
