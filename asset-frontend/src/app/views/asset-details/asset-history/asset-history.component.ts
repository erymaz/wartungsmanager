import { Component, Input, OnInit } from '@angular/core';

import { ActivityLog } from '../../../shared/models';
import { AssetApiService } from '../../../shared/services/asset-api.service';

@Component({
  selector: 'app-asset-history',
  templateUrl: './asset-history.component.html',
  styleUrls: ['./asset-history.component.scss'],
})
export class AssetHistoryComponent implements OnInit {
  activities: ActivityLog[] = [];

  @Input() assetId!: string | null;

  constructor(private assetApiService: AssetApiService) { }

  async ngOnInit(): Promise<void> {
    if (this.assetId) {
      this.activities = await this.assetApiService.getAssetActivities(this.assetId);
    }
  }
}
