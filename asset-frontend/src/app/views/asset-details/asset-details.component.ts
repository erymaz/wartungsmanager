import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject } from 'rxjs';

import { AssetApiService } from '../../shared/services/asset-api.service';
import { ModalConfirmComponent, ModalMessageComponent } from '../../shared/modals';
import { AssetDto, AssetTreeNodeDto, MultilangValue } from 'shared/common/models';
import { takeUntil } from 'rxjs/operators';
import { NavigationService } from '../../shared/services/navigation.service';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss'],
})
export class AssetDetailsComponent implements OnInit, OnDestroy {
  asset = {} as AssetDto;
  form!: FormGroup;
  parent: AssetDto | null = null;
  editMode = false;
  changedProperties: {
    value?: string;
    position: number | null;
    id: string;
  }[] = [];

  name$ = new BehaviorSubject<MultilangValue | null>(null);

  private hasChildren = false;
  private assetTree: AssetTreeNodeDto[] = [];
  private destroyed$ = new Subject<void>();

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private assetApiService: AssetApiService,
    private navigationService: NavigationService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.form = this.buildForm();

    this.name.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.name$.next({ ...value }));

    if (this.route.snapshot.data.asset) {
      this.editMode = true;
      this.asset = this.route.snapshot.data.asset;

      this.form.patchValue(this.asset);

      this.assetTree = await this.assetApiService.getAssetTree();

      this.parent = this.getParen();
      this.hasChildren = this.getChildren().length > 0;
    }
  }

  async onSave() {
    try {
      if (this.editMode) {
        await this.updateProperties();
        await this.assetApiService.updateAsset(this.asset.id, this.form.value);
      } else {
        await this.assetApiService.createAsset(this.form.value);
      }

      this.editMode ? this.navigationService.back() : this.navigationService.navigate('AssetPool');
    } catch (ex) {}
  }

  async onDeallocate(): Promise<void> {
    if (this.hasChildren) {
      return this.openInvalidActionModal();
    }

    try {
      await this.assetApiService.deallocate(this.asset.id, this.parent?.id || null);
    } catch (ex) {}
  }

  async onDelete(): Promise<void> {
    if (this.hasChildren) {
      return this.openInvalidActionModal();
    }

    const confirmed = await this.openConfirmModal();

    if (confirmed) {
      try {
        await this.onDeallocate();
        await this.assetApiService.deleteAsset(this.asset.id);
        this.navigationService.back();
      } catch (ex) {}
    }
  }

  private openInvalidActionModal(): void {
    const modal = this.modalService.open(ModalMessageComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_MESSAGE.TITLE',
      body: 'MODALS.DELETE_ASSET_MESSAGE.BODY',
      dismiss: 'MODALS.DELETE_ASSET_MESSAGE.DISMISS',
    };
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_CONFIRM.ABORT',
    };
    return modal.result;
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      imageId: [null],
      name: [null],
      assetType: [null],
      description: [null],
      aliases: [[]],
      documents: [[]],
    });
  }

  private getParen(): AssetDto | null {
    const stack = [...this.assetTree];

    while (stack.length) {
      const node = stack.shift() as AssetTreeNodeDto;

      if (node.children.some(child => child.id === this.asset.id)) {
        return node;
      }
      stack.push(...node.children);
    }
    return null;
  }

  private getChildren(): AssetTreeNodeDto[] {
    const stack = [...this.assetTree];

    while (stack.length) {
      const node = stack.shift() as AssetTreeNodeDto;

      if (node.id === this.asset.id) {
        return node.children;
      }
      stack.push(...node.children);
    }
    return [];
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  setChangedProperties(
    properties: {
      value?: string;
      position: number | null;
      id: string;
    }[],
  ) {
    this.changedProperties = properties;
  }

  updateProperties() {
    this.changedProperties.forEach(property => {
      this.assetApiService.updateAssetProperty(this.asset.id, property.id, {
        value: property.value,
        position: property.position,
      });
    });
  }
}
