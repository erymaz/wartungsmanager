import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetTypeDto, MultilangValue } from 'shared/common/models';

import { ModalConfirmComponent, ModalMessageComponent } from '../../shared/modals';
import { AssetApiService } from '../../shared/services/asset-api.service';
import { NavigationService } from '../../shared/services/navigation.service';

@Component({
  selector: 'app-asset-type-details',
  templateUrl: './asset-type-details.component.html',
  styleUrls: ['./asset-type-details.component.scss'],
})
export class AssetTypeDetailsComponent implements OnInit, OnDestroy {
  assetType = {} as AssetTypeDto;
  form!: FormGroup;
  editMode = false;

  name$ = new BehaviorSubject<MultilangValue | null>(null);

  private destroyed$ = new Subject<void>();

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private assetApiService: AssetApiService,
    private navigationService: NavigationService,
  ) {}

  ngOnInit(): void {
    this.form = this.buildForm();

    this.name.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.name$.next({ ...value }));

    if (this.route.snapshot.data.assetType) {
      this.editMode = true;
      this.assetType = this.route.snapshot.data.assetType;

      this.form.patchValue(this.assetType);

      if (this.assetType.isBuiltIn) {
        this.form.controls['equipmentType'].disable();
      }
    }
  }

  async onSave() {
    try {
      this.editMode
        ? await this.assetApiService.updateAssetType(this.assetType.id, this.form.value)
        : await this.assetApiService.createAssetType(this.form.value);

      this.navigationService.navigate('AssetTypes');
    } catch (ex) {}
  }

  async onDelete(): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (confirmed) {
      try {
        await this.assetApiService.deleteAssetType(this.assetType.id);
        this.navigationService.navigate('AssetTypes');
      } catch (ex) {
        const modal = this.modalService.open(ModalMessageComponent, { centered: true });

        modal.componentInstance.content = {
          title: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.TITLE',
          body: ex.message || 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.BODY',
          dismiss: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.DISMISS',
        };
      }
    }
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.ABORT',
    };
    return modal.result;
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      name: [null],
      description: [null],
      extendsType: [null],
      equipmentType: [null],
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
