import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { LogModule } from 'ng-debug-levels';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationInterceptor } from './shared/interceptors/authorization.interceptor';
import { SharedModule } from './shared/shared.module';
import { AddAliasModalComponent } from './views/asset-details/asset-aliases/add-alias-modal/add-alias-modal.component';
import { AssetAliasesComponent } from './views/asset-details/asset-aliases/asset-aliases.component';
import { AssetDetailsFormComponent } from './views/asset-details/asset-details-form/asset-details-form.component';
import { AssetDetailsComponent } from './views/asset-details/asset-details.component';
import { AssetDocumentsComponent } from './views/asset-details/asset-documents/asset-documents.component';
import { DocumentModalComponent } from './views/asset-details/asset-documents/document-modal/document-modal.component';
import { AssetHistoryComponent } from './views/asset-details/asset-history/asset-history.component';
import { AllocatedAssetsComponent } from './views/asset-tabs-outlet/allocated-assets/allocated-assets.component';
import { AssetPoolModalComponent } from './views/asset-tabs-outlet/allocated-assets/asset-pool-modal/asset-pool-modal.component';
import { AssetPoolComponent } from './views/asset-tabs-outlet/asset-pool/asset-pool.component';
import { AssetTabsOutletComponent } from './views/asset-tabs-outlet/asset-tabs-outlet.component';
import { AssetTypesComponent } from './views/asset-tabs-outlet/asset-types/asset-types.component';
import { AssetHierarchyDropdownComponent } from './views/asset-tabs-outlet/shared/components/asset-hierarchy-dropdown/asset-hierarchy-dropdown.component';
import { AssetTypeDetailsFormComponent } from './views/asset-type-details/asset-type-details-form/asset-type-details-form.component';
import { AssetTypeDetailsComponent } from './views/asset-type-details/asset-type-details.component';
import { AssetTypePropertiesComponent } from './views/asset-type-details/asset-type-properties/asset-type-properties.component';
import { PropertyModalComponent } from './views/asset-type-details/asset-type-properties/property-modal/property-modal.component';
import { AssetTypeAssignedAssetsComponent } from './views/asset-type-details/asset-type-assigned-assets/asset-type-assigned-assets.component';
import { AssetDynamicPropertiesComponent } from './views/asset-details/asset-dynamic-properties/asset-dynamic-properties.component';

@NgModule({
  declarations: [
    AppComponent,
    AllocatedAssetsComponent,
    AssetTabsOutletComponent,
    AssetPoolComponent,
    AssetTypesComponent,
    AssetHierarchyDropdownComponent,
    AssetDetailsComponent,
    AssetDetailsFormComponent,
    AssetDocumentsComponent,
    AssetHistoryComponent,
    AssetAliasesComponent,
    AddAliasModalComponent,
    DocumentModalComponent,
    AssetPoolModalComponent,
    AssetTypeDetailsComponent,
    AssetTypeDetailsFormComponent,
    AssetTypePropertiesComponent,
    PropertyModalComponent,
    AssetTypeAssignedAssetsComponent,
    AssetDynamicPropertiesComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    LogModule,
    SharedModule,
    DragDropModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizationInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
