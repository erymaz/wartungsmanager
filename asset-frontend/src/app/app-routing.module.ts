import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AllocatedAssetsComponent } from './views/asset-tabs-outlet/allocated-assets/allocated-assets.component';
import { AssetPoolComponent } from './views/asset-tabs-outlet/asset-pool/asset-pool.component';
import { AssetTabsOutletComponent } from './views/asset-tabs-outlet/asset-tabs-outlet.component';
import { AssetTypesComponent } from './views/asset-tabs-outlet/asset-types/asset-types.component';
import { AssetDetailsComponent } from './views/asset-details/asset-details.component';
import { AssetDetailsResolver } from './views/asset-details/asset-details.resolver';
import { AssetTypeDetailsComponent } from './views/asset-type-details/asset-type-details.component';
import { AssetTypeDetailsResolver } from './views/asset-type-details/asset-type-details.resolver';

const routes: Routes = [
  {
    path: '',
    component: AssetTabsOutletComponent,
    children: [
      { path: '', redirectTo: 'allocated-assets', pathMatch: 'full' },
      { path: 'allocated-assets', component: AllocatedAssetsComponent },
      { path: 'asset-pool', component: AssetPoolComponent },
      { path: 'asset-types', component: AssetTypesComponent },
    ],
  },
  {
    path: 'assets/new',
    component: AssetDetailsComponent,
  },
  {
    path: 'assets/:id',
    component: AssetDetailsComponent,
    resolve: { asset: AssetDetailsResolver },
  },
  {
    path: 'asset-types/new',
    component: AssetTypeDetailsComponent,
  },
  {
    path: 'asset-types/:id',
    component: AssetTypeDetailsComponent,
    resolve: { assetType: AssetTypeDetailsResolver },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
