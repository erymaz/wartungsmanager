import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetDto } from 'shared/common/models';

import { AssetApiService } from '../../../../shared/services/asset-api.service';

@Component({
  selector: 'app-asset-pool-modal',
  templateUrl: './asset-pool-modal.component.html',
  styleUrls: ['./asset-pool-modal.component.scss'],
})
export class AssetPoolModalComponent implements OnInit {
  loading = true;
  assets: AssetDto[] = [];
  indexesToAssign: number[] = [];

  constructor(private modal: NgbActiveModal, private assetApiService: AssetApiService) {}

  async ngOnInit(): Promise<void> {
    this.assets = await this.assetApiService.getUnassignedAssets();
    this.loading = false;
  }

  onSelect(index: number, selected: boolean): void {
    selected
      ? this.indexesToAssign.push(index)
      : (this.indexesToAssign = this.indexesToAssign.filter(i => i !== index));
  }

  onCancel(): void {
    this.modal.close([]);
  }

  onConfirm(): void {
    this.modal.close(this.indexesToAssign.map(i => this.assets[i]));
  }
}
