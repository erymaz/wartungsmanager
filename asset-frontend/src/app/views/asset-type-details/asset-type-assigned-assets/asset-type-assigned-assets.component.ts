import { Component, Input, OnInit } from '@angular/core';
import { AssetDto } from 'shared/common/models';
import { AssetApiService } from 'src/app/shared/services/asset-api.service';

@Component({
  selector: 'app-asset-type-assigned-assets',
  templateUrl: './asset-type-assigned-assets.component.html',
  styleUrls: ['./asset-type-assigned-assets.component.scss'],
})
export class AssetTypeAssignedAssetsComponent implements OnInit {
  @Input() assetTypeId!: string;

  assets: AssetDto[] = [];
  constructor(private assetApiService: AssetApiService) {}

  async ngOnInit(): Promise<void> {
    this.assets = (await this.assetApiService.getAssetType(this.assetTypeId))?.assets || [];
  }
}
