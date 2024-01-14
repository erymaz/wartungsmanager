import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, DataResponse } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import urlJoin from 'url-join';

const SERVICE_URL = urlJoin(environment.hubServiceUrl, 'general');

export interface GeneralConfiguration {
  key: string;
  value?: string | number | null;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeneralConfigurationService {
  generalConfiguration = new BehaviorSubject<GeneralConfiguration[]>([]);

  constructor(private apiService: ApiService) {
    this.getHttpGeneralConfiguration();
  }

  getGeneralConfiguration(): Observable<GeneralConfiguration[]> {
    return this.generalConfiguration;
  }

  setGeneralConfiguration(values: GeneralConfiguration[]) {
    this.generalConfiguration.next(values);
  }

  async getHttpGeneralConfiguration() {
    const configurations: HttpResponse<DataResponse<
      GeneralConfiguration[]
    > | null> = await this.apiService.get(SERVICE_URL);
    if (!configurations.body) return;
    this.setGeneralConfiguration(configurations.body?.data);
  }

  async updateHttpGeneralConfiguration(value: Array<Partial<GeneralConfiguration>>) {
    const light = value.find(item => item.key === 'light');
    if (light) {
      light.value = light.value ? '1' : null;
    }

    const configuration: HttpResponse<DataResponse<
      GeneralConfiguration[]
    > | null> = await this.apiService.post(SERVICE_URL, value);
    if (!configuration.body) return;
    this.setGeneralConfiguration(configuration.body?.data);
  }

  getProperty(key: string): GeneralConfiguration | undefined {
    const property = this.generalConfiguration.getValue().find(item => item.key === key);
    return property;
  }
}
