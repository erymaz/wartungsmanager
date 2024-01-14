import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';

import {
  GeneralConfiguration,
  GeneralConfigurationService,
} from '../shared/services/general-configuration.service';
import {
  TileConfiguration,
  TileConfigurationService,
} from '../shared/services/tile-configuration.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  generalConfiguration: GeneralConfiguration[] = [];
  cards: TileConfiguration[] = [];
  mode = '';
  username = '';
  constructor(
    private generalConfigurationService: GeneralConfigurationService,
    private tileConfigurationService: TileConfigurationService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.username = this.apiService.getDfAppSessionCookieContent()?.name || '';

    this.generalConfigurationService.getGeneralConfiguration().subscribe(value => {
      this.generalConfiguration = value;
    });
    this.tileConfigurationService.getHttpTileConfigurations();
    this.tileConfigurationService.getTileConfigurations().subscribe(value => {
      this.cards = value;
      this.getViewTileMode();
    });
  }

  get bgColor() {
    const bgColor = this.generalConfigurationService.getProperty('bgColor');
    return bgColor?.value || '';
  }

  get light() {
    const light = this.generalConfigurationService.getProperty('light');
    return light?.value || '';
  }

  getViewTileMode() {
    switch (this.cards.length) {
      case 1:
        this.mode = '1x1';
        break;
      case 2:
        this.mode = '1x2';
        break;
      case 3:
      case 4:
        this.mode = '2x2';
        break;
      case 5:
      case 6:
        this.mode = '2x3';
        break;
      case 7:
      case 8:
        this.mode = '2x4';
        break;
      default:
        this.mode = '2x5';
        break;
    }
  }
}
