import { Component, OnInit } from '@angular/core';

import {
  TileConfiguration,
  TileConfigurationService,
} from '../../services/tile-configuration.service';
import urlJoin from 'url-join';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  tileConfigurations: TileConfiguration[] = [];
  baseUrl = `${location.href}/`;

  constructor(
    private tileConfigurationService: TileConfigurationService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.tileConfigurationService.getTileConfigurations().subscribe(value => {
      this.tileConfigurations = value.map(item => ({
        ...item,
        appUrl:
          item.appUrl.includes('http://') || item.appUrl.includes('https://')
            ? item.appUrl
            : urlJoin(this.baseUrl, item.appUrl),
      }));
    });

    this.tileConfigurationService.getHttpTileConfigurations();
  }
}
