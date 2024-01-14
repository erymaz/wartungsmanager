import { Component, Input, OnInit } from '@angular/core';

import { FileService } from '../../services/file.service';
import {
  TileConfiguration,
  TileConfigurationService,
} from '../../services/tile-configuration.service';

export interface CardData {
  title: string;
  desc?: string;
  img?: string;
}

@Component({
  selector: 'app-tile-card',
  templateUrl: './tile-card.component.html',
  styleUrls: ['./tile-card.component.scss'],
})
export class TileCardComponent implements OnInit {
  @Input() mode: 'preview' | '' = '';
  @Input() config: TileConfiguration | undefined;

  baseUrl = `${location.origin}/`;

  constructor(
    private fileService: FileService,
    private tileConfigurationService: TileConfigurationService,
  ) {}

  ngOnInit(): void {}

  preventInPreviewMode(event: Event, input: HTMLInputElement) {
    if (this.mode !== 'preview') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    input.click();
  }

  async customEventHandler(files: File[] | FileList) {
    const file = await this.fileService.uploadFile(files[0]);
    if (this.config && file) {
      await this.tileConfigurationService.setTileConfiguration(this.config.id, {
        iconUrl: file.id,
      });
    }
  }
}
