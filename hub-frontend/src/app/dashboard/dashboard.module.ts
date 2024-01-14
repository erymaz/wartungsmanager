import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { HasRightDirective } from '../shared/has-right.directive';
import { SharedModule } from '../shared/shared.module';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { PageLayoutComponent } from './shared/components/page-layout/page-layout.component';
import { TileCardComponent } from './shared/components/tile-card/tile-card.component';
import { IconUrlPipe } from './shared/pipes/icon-url.pipe';

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    HeaderComponent,
    PageLayoutComponent,
    FooterComponent,
    SettingsComponent,
    TileCardComponent,
    IconUrlPipe,
    HasRightDirective,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgbModule,
    SharedModule,
    TranslateModule.forChild(),
  ],
})
export class DashboardModule {}
