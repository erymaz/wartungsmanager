import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import urlJoin from 'url-join';

import { GeneralConfigurationService } from '../../services/general-configuration.service';
import {
  TileConfiguration,
  TileConfigurationService,
} from '../../services/tile-configuration.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  tileConfigurations: TileConfiguration[] = [];
  baseUrl = `${location.href}/`;
  basicColor = '';
  logoutUrl = environment.userServiceUrl + 'v1/auth/logout';
  tenantName = '';
  username = '';
  userImageUrl = '';
  constructor(
    private tileConfigurationService: TileConfigurationService,
    private generalConfigurationService: GeneralConfigurationService,
    private apiService: ApiService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.username = this.apiService.getDfAppSessionCookieContent()?.name || '';
    this.tileConfigurationService.getTileConfigurations().subscribe(value => {
      this.tileConfigurations = value.map(item => ({
        ...item,
        appUrl:
          item.appUrl.includes('http://') || item.appUrl.includes('https://')
            ? item.appUrl
            : urlJoin(this.baseUrl, item.appUrl),
      }));
    });
    this.generalConfigurationService.getGeneralConfiguration().subscribe(values => {
      const color = values.find(item => item.key === 'primaryColor');
      if (color && color.value) this.basicColor = color.value.toString() || '';
    });
  }
}
