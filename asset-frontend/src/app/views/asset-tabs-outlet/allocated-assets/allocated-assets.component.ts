import { Component, OnInit, ViewChild } from '@angular/core';
import { AssetDto, AssetTreeNodeDto } from 'shared/common/models';
import { environment } from 'src/environments/environment';

import { TreeNode, TreeTableComponent } from '../../../shared/containers';
import { ModalConfirmComponent, ModalMessageComponent } from '../../../shared/modals';
import { AssetTabDirective } from '../asset-tab';

import { AssetPoolModalComponent } from './asset-pool-modal/asset-pool-modal.component';

@Component({
  selector: 'app-allocated-assets',
  templateUrl: './allocated-assets.component.html',
  styleUrls: ['./allocated-assets.component.scss'],
})
export class AllocatedAssetsComponent extends AssetTabDirective implements OnInit {
  loading = true;
  assets: AssetTreeNodeDto[] = [];
  headers = [
    'VIEWS.ALLOCATED_ASSETS.NAME',
    'VIEWS.ALLOCATED_ASSETS.TYPE',
    'VIEWS.ALLOCATED_ASSETS.ID',
    'VIEWS.ALLOCATED_ASSETS.DOCUMENTS',
    'VIEWS.ALLOCATED_ASSETS.CREATED_OR_UPDATED_AT',
    'VIEWS.ALLOCATED_ASSETS.CHANGE_ORDER',
  ];

  @ViewChild(TreeTableComponent) table!: TreeTableComponent<AssetTreeNodeDto>;

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.assets = await this.assetApiService.getAssetTree();
    this.loading = false;
  }

  getIdentifier(asset: AssetTreeNodeDto): string {
    return asset.id;
  }

  getChildren(asset: AssetTreeNodeDto): AssetTreeNodeDto[] {
    return asset.children;
  }

  async swap(node: TreeNode<AssetTreeNodeDto>, toIndex: number): Promise<void> {
    this.table.swapNode(node, toIndex);

    const siblings = node.parent?.children || this.table.rootNodes;

    try {
      await this.transform(
        node,
        node.parent?.id || null,
        siblings.map(n => n.id),
      );
    } catch (ex) {}
  }

  async switchParent(node: TreeNode<AssetTreeNodeDto>, parentId: string | null): Promise<void> {
    this.table.switchParent(node, parentId);

    try {
      await this.transform(
        node,
        parentId,
        node.children.map(n => n.id),
      );
    } catch (ex) {}
  }

  async openAssetPoolModal(node: TreeNode<AssetTreeNodeDto>): Promise<void> {
    const modal = this.modalService.open(AssetPoolModalComponent, {
      centered: true,
      backdrop: 'static',
    });
    const assets: AssetDto[] = await modal.result;

    if (assets.length) {
      await this.assetApiService.transformMany(
        assets.map(asset => asset.id),
        node.id,
      );

      this.table.addNodes(
        node.id,
        assets.map(a => ({ ...a, children: [] })),
      );
    }
  }

  async deallocate(node: TreeNode<AssetTreeNodeDto>): Promise<void> {
    if (node.children.length > 0) {
      return this.openInvalidActionModal();
    }

    try {
      this.table.deleteNode(node);
      await this.assetApiService.deallocate(node.id, node.parent?.id || null);
    } catch (ex) {}
  }

  async delete(node: TreeNode<AssetTreeNodeDto>): Promise<void> {
    if (node.children.length > 0) {
      return this.openInvalidActionModal();
    }

    const confirmed = await this.openConfirmModal();

    if (confirmed) {
      try {
        await this.deallocate(node);
        await this.assetApiService.deleteAsset(node.id);
      } catch (ex) {}
    }
  }

  imageIdToUrl(imageId: string) {
    if (!imageId) return;
    return `${environment.fileServiceUrl}v1/image/${imageId}`;
  }

  private async transform(
    node: TreeNode<AssetTreeNodeDto>,
    parentId: string | null,
    order: string[],
  ): Promise<void> {
    await this.assetApiService.transform(node.id, parentId, order);
  }

  private openInvalidActionModal(): void {
    const modal = this.modalService.open(ModalMessageComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_MESSAGE.TITLE',
      body: 'MODALS.DELETE_ASSET_MESSAGE.BODY',
      dismiss: 'MODALS.DELETE_ASSET_MESSAGE.DISMISS',
    };
  }

  private openConfirmModal(): Promise<boolean> {
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
