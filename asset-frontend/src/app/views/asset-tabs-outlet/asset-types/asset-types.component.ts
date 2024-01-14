import { Component, OnInit } from '@angular/core';
import { AssetTypeDto } from 'shared/common/models';

import { ModalConfirmComponent, ModalMessageComponent } from '../../../shared/modals';
import { AssetTabDirective } from '../asset-tab';

@Component({
  selector: 'app-asset-types',
  templateUrl: './asset-types.component.html',
  styleUrls: ['./asset-types.component.scss'],
})
export class AssetTypesComponent extends AssetTabDirective implements OnInit {
  assetTypes: AssetTypeDto[] = [];

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.assetTypes = await this.assetApiService.getAssetTypes();
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (!confirmed) {
      return;
    }

    try {
      await this.assetApiService.deleteAssetType(id);
      this.assetTypes = this.assetTypes.filter(assetType => assetType.id !== id);
    } catch (ex) {
      const modal = this.modalService.open(ModalMessageComponent, { centered: true });

      modal.componentInstance.content = {
        title: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.TITLE',
        body: ex.message || 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.BODY',
        dismiss: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.DISMISS',
      };
    }
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.ABORT',
    };
    return modal.result;
  }
}
