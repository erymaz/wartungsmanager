import { Component, forwardRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AddAliasModalComponent } from './add-alias-modal/add-alias-modal.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AssetAliasDto } from 'shared/common/models';

const ASSET_ALIASES_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AssetAliasesComponent),
  multi: true,
};

@Component({
  selector: 'app-asset-aliases',
  templateUrl: './asset-aliases.component.html',
  styleUrls: ['./asset-aliases.component.scss'],
  providers: [ASSET_ALIASES_CONTROL_ACCESSOR],
})
export class AssetAliasesComponent implements ControlValueAccessor {
  private onTouch!: () => void;
  private onModalChange!: (aliases: AssetAliasDto[]) => void;

  disabled = false;
  aliases: AssetAliasDto[] = [];

  constructor(private modalService: NgbModal) {}

  async openAddAliasModal(): Promise<void> {
    const modal = this.modalService.open(AddAliasModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const alias = await modal.result;

    if (alias) {
      this.onTouch();
      this.aliases = [...this.aliases, alias];
      this.onModalChange(this.aliases);
    }
  }

  writeValue(aliases: AssetAliasDto[]): void {
    this.aliases = aliases;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  registerOnChange(fn: (aliases: AssetAliasDto[]) => void): void {
    this.onModalChange = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
