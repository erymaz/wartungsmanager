import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, DataResponse } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import urlJoin from 'url-join';

const SERVICE_BASE_PATH = urlJoin(environment.hubServiceUrl, 'tile-configuration')

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
export class TileConfigurationService {
  tileConfiguration = new BehaviorSubject<TileConfiguration[]>([]);

  constructor(private apiService: ApiService) {}

  setTileConfigurations(newConfigs: TileConfiguration[]) {
    this.tileConfiguration.next(newConfigs);
  }

  getTileConfigurations(): Observable<TileConfiguration[]> {
    return this.tileConfiguration;
  }

  async setTileConfiguration(id: number, newConfig: Partial<TileConfiguration>) {
    const updatedItem: HttpResponse<DataResponse<
      TileConfiguration
    > | null> = await this.apiService.put(urlJoin(SERVICE_BASE_PATH, id.toString()), {
      ...newConfig,
    });

    const tileConfiguration = this.tileConfiguration.value;
    const config = tileConfiguration.find(item => item.id === id);
    if (!config || !updatedItem.body) return;
    const keys = Object.keys(updatedItem.body.data);

    for (const key of keys) {
      (config[key as keyof TileConfiguration] as string | number) = updatedItem.body.data[
        key as keyof TileConfiguration
      ] as string | number;
    }

    this.setTileConfigurations(tileConfiguration);
  }

  async deleteConfig(id: number) {
    await this.apiService.delete(urlJoin(SERVICE_BASE_PATH, id.toString()));
    this.setTileConfigurations(this.tileConfiguration.value.filter(item => item.id !== id));
  }

  async changePosition(from: number, to: number) {
    await this.apiService.put(urlJoin(SERVICE_BASE_PATH, 'change-position'), {
      fromId: from,
      toId: to,
    });

    const tileConfiguration = this.tileConfiguration.value;

    const fromIndex = tileConfiguration.findIndex(item => item.id === from);
    const toIndex = tileConfiguration.findIndex(item => item.id === to);

    if ((!fromIndex && fromIndex !== 0) || (!toIndex && toIndex !== 0)) {
      return;
    }

    const fromEl = { ...tileConfiguration[fromIndex] };

    tileConfiguration[fromIndex] = { ...tileConfiguration[toIndex] };
    tileConfiguration[toIndex] = fromEl;

    this.setTileConfigurations([...tileConfiguration]);
  }

  async getHttpTileConfigurations() {
    const configuration: HttpResponse<DataResponse<
      TileConfiguration[]
    > | null> = await this.apiService.get(SERVICE_BASE_PATH);
    this.setTileConfigurations(configuration.body?.data || []);
  }

  async createEmptyTileConfigurations() {
    const tileConfiguration = this.tileConfiguration.value;
    const configuration: HttpResponse<DataResponse<
      TileConfiguration
    > | null> = await this.apiService.post(urlJoin(SERVICE_BASE_PATH), {})
    if (!configuration.body) return;
    tileConfiguration.push({
      appUrl: configuration.body.data.appUrl,
      desc: configuration.body.data.desc,
      iconUrl: configuration.body.data.iconUrl,
      id: configuration.body.data.id,
      tileColor: configuration.body.data.tileColor,
      tileName: configuration.body.data.tileName,
      tileTextColor: configuration.body.data.tileTextColor,
      order: configuration.body.data.order,
    });
    this.setTileConfigurations(tileConfiguration);
  }
}
