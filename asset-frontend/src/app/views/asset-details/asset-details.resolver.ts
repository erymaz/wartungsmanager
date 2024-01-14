import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { AssetDto } from 'shared/common/models';

import { AssetApiService } from '../../shared/services/asset-api.service';

@Injectable({ providedIn: 'root' })
export class AssetDetailsResolver implements Resolve<AssetDto | null> {
  constructor(private router: Router, private assetApiService: AssetApiService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<AssetDto | null> {
    const id = route.paramMap.get('id') as string;
    const asset = await this.assetApiService.getAsset(id);

    if (!asset) {
      await this.router.navigate(['/']);
      return null;
    }
    return asset;
  }
}
