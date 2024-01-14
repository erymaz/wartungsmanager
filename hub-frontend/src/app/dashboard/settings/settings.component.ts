import { Component, OnInit } from '@angular/core';

import {
  GeneralConfiguration,
  GeneralConfigurationService,
} from '../shared/services/general-configuration.service';
import {
  TileConfiguration,
  TileConfigurationService,
} from '../shared/services/tile-configuration.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  setting = 'general';
  generalConfiguration: GeneralConfiguration[] | undefined;
  tileConfiguration: TileConfiguration[] | undefined;

  constructor(
    private generalConfigurationService: GeneralConfigurationService,
    private tileConfigurationService: TileConfigurationService,
  ) {}

  ngOnInit(): void {
    this.tileConfigurationService.getHttpTileConfigurations();
    this.generalConfigurationService.getGeneralConfiguration().subscribe(value => {
      if (!value) this.generalConfigurationService.getHttpGeneralConfiguration();
      this.generalConfiguration = value;
    });
    this.tileConfigurationService.getTileConfigurations().subscribe(value => {
      this.tileConfiguration = value;
    });
  }

  setConfigValues(newValue: Partial<GeneralConfiguration>) {
    const configs = this.generalConfiguration;
    if (configs) {
      const config = configs.find(item => item.key === newValue.key);
      if (config) {
        config.value = newValue.value;
        this.generalConfiguration = configs;
      }
    }
  }

  setTileConfigValues(newValue: Partial<TileConfiguration>, id: number) {
    this.tileConfigurationService.setTileConfiguration(id, {
      ...newValue,
    });
  }

  setGeneralConfiguration() {
    if (!this.generalConfiguration) return;
    this.generalConfigurationService.updateHttpGeneralConfiguration(this.generalConfiguration);
  }

  deleteTile(id: number) {
    this.tileConfigurationService.deleteConfig(id);
  }

  changePosition(from: number, to: number) {
    this.tileConfigurationService.changePosition(from, to);
  }

  addTile() {
    this.tileConfigurationService.createEmptyTileConfigurations();
  }

  get primaryColor() {
    return this.generalConfigurationService.getProperty('primaryColor')?.value;
  }

  get bgColor() {
    return this.generalConfigurationService.getProperty('bgColor')?.value;
  }

  get light() {
    return this.generalConfigurationService.getProperty('light')?.value;
  }

  get bgImage() {
    return this.generalConfigurationService.getProperty('bgImage')?.value as string;
  }
}
