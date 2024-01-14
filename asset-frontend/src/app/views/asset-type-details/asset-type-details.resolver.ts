import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { AssetTypeDto } from 'shared/common/models';

import { AssetApiService } from '../../shared/services/asset-api.service';

@Injectable({ providedIn: 'root' })
export class AssetTypeDetailsResolver implements Resolve<AssetTypeDto | null> {
  constructor(private router: Router, private assetApiService: AssetApiService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<AssetTypeDto | null> {
    const id = route.paramMap.get('id') as string;
    const assetType = await this.assetApiService.getAssetType(id);

    if (!assetType) {
      await this.router.navigate(['/']);
      return null;
    }
    return assetType;
  }
}
