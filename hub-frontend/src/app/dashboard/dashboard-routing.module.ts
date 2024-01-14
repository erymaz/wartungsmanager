import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WRITE_KEY } from '../shared/services/api.service';

import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
        // canActivate: [RightGuard],
        data: { right: WRITE_KEY },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
