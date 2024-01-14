import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { CheckboxComponent, FooterComponent, HeaderComponent, LoaderComponent, SearchComponent } from './components';
import {
  CellDirective,
  DataRowDefDirective,
  DataRowDirective,
  EmptyRowDefDirective,
  EmptyRowDirective,
  HeaderCellComponent,
  HeaderRowDefDirective,
  HeaderSortDirective,
  PanelBodyDirective,
  PanelComponent,
  PanelHeaderActionsDirective,
  PanelHeaderDirective,
  RowComponent,
  TableComponent,
  TreeDataRowDefDirective,
  TreeDataRowDirective,
  TreeTableComponent,
  TreeToggleCellComponent,
} from './containers';
import {
  BackButtonDirective,
  MultilangDirective,
  MultilangFormControlDirective,
  UploadButtonDirective,
} from './directives';
import { ModalConfirmComponent, ModalMessageComponent } from './modals';
import { FilterPipe, SortByPipe, UsernamePipe, IconUrlPipe } from './pipes';

const declarations = [
  CheckboxComponent,
  FooterComponent,
  HeaderComponent,
  LoaderComponent,
  SearchComponent,
  TreeTableComponent,
  DataRowDirective,
  CellDirective,
  TreeDataRowDefDirective,
  TreeDataRowDirective,
  DataRowDefDirective,
  EmptyRowDefDirective,
  EmptyRowDirective,
  HeaderCellComponent,
  HeaderRowDefDirective,
  HeaderSortDirective,
  PanelBodyDirective,
  PanelComponent,
  PanelHeaderActionsDirective,
  PanelHeaderDirective,
  RowComponent,
  TableComponent,
  TreeToggleCellComponent,
  BackButtonDirective,
  MultilangDirective,
  MultilangFormControlDirective,
  UploadButtonDirective,
  ModalConfirmComponent,
  ModalMessageComponent,
  FilterPipe,
  SortByPipe,
  UsernamePipe,
  IconUrlPipe,
];

@NgModule({
  declarations,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkTreeModule,
    NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [...declarations, CdkTreeModule, NgbModule, TranslateModule],
})
export class SharedModule {}

function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
