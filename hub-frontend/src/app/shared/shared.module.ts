import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';

import { ButtonComponent } from './components/button/button.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { InputComponent } from './components/input/input.component';
import { PageCardLayoutComponent } from './components/page-card-layout/page-card-layout.component';
import { LoggerModule } from './logger/logger.module';

@NgModule({
  declarations: [InputComponent, ButtonComponent, PageCardLayoutComponent, CheckboxComponent],
  imports: [LoggerModule, CommonModule, FormsModule, ReactiveFormsModule, ColorPickerModule],
  providers: [],
  bootstrap: [],
  exports: [InputComponent, ButtonComponent, PageCardLayoutComponent, CheckboxComponent],
})
export class SharedModule {}
