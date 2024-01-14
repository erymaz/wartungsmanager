import { Component, OnInit } from '@angular/core';
import { AssetDto, AssetTreeNodeDto } from 'shared/common/models';
import { environment } from 'src/environments/environment';

import { ModalConfirmComponent } from '../../../shared/modals';
import { AssetTabDirective } from '../asset-tab';

@Component({
  selector: 'app-asset-pool',
  templateUrl: './asset-pool.component.html',
  styleUrls: ['./asset-pool.component.scss'],
})
export class AssetPoolComponent extends AssetTabDirective implements OnInit {
  loading = true;
  assets: AssetDto[] = [];
  assetTree: AssetTreeNodeDto[] = [];

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.assets = await this.assetApiService.getUnassignedAssets();
    this.assetTree = await this.assetApiService.getAssetTree();
    this.loading = false;
  }

  async transform(id: string, parentId: string) {
    this.removeAsset(id);

    try {
      await this.assetApiService.transform(id, parentId);
      this.assetTree = await this.assetApiService.getAssetTree();
    } catch (ex) {}
  }

  async delete(id: string) {
    const confirmed = await this.showConfirmModal();

    if (confirmed) {
      this.removeAsset(id);

      try {
        await this.assetApiService.deleteAsset(id);
      } catch (ex) {}
    }
  }

  imageIdToUrl(imageId: string) {
    if (!imageId) return;
    return `${environment.fileServiceUrl}v1/image/${imageId}`;
  }

  private removeAsset(id: string) {
    this.assets = this.assets.filter(a => a.id !== id);
  }

  private showConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_CONFIRM.ABORT',
    };
    return modal.result;
  }
}
