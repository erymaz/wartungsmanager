import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UnitedPropertyDto } from 'shared/common/models';

import { ModalConfirmComponent } from '../../../shared/modals';
import { AssetApiService } from '../../../shared/services/asset-api.service';

import { PropertyModalComponent } from './property-modal/property-modal.component';

@Component({
  selector: 'app-asset-type-properties',
  templateUrl: './asset-type-properties.component.html',
  styleUrls: ['./asset-type-properties.component.scss'],
})
export class AssetTypePropertiesComponent implements OnInit {
  properties: UnitedPropertyDto[] = [];

  @Input() assetTypeId!: string;

  constructor(
    private modalService: NgbModal,
    private assetApiService: AssetApiService,
    private toastrService: ToastrService,
  ) {}

  async drop(event: CdkDragDrop<string[]>) {
    await this.changePropertyPosition(event.previousIndex, event.currentIndex);
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  async changePropertyPosition(fromIndex: number, toIndex: number) {
    const fromItem = this.properties[fromIndex];
    const toItem = this.properties[toIndex];

    if (!fromItem || !toItem) return;

    const fromPosition = fromItem.position;

    fromItem.position = toItem.position;
    toItem.position = fromPosition;

    await this.assetApiService.updateAssetTypeProperty(fromItem.id, this.assetTypeId, fromItem);
    await this.assetApiService.updateAssetTypeProperty(toItem.id, this.assetTypeId, toItem);
  }

  async ngOnInit(): Promise<void> {
    this.properties = await this.assetApiService.getAssetTypeProperties(this.assetTypeId);
  }

  async onAdd(): Promise<void> {
    const modal = await this.openPropertyModal();

    modal.componentInstance.submitData.subscribe(async (prop: UnitedPropertyDto | null) => {
      const [prevProp] = this.properties.slice(-1);

      if (prop) {
        prop['position'] = prevProp?.position ? ++prevProp.position : 0;
        try {
          const property = await this.assetApiService.createAssetTypeProperty(
            this.assetTypeId,
            prop,
          );

          if (property) {
            this.properties = [...this.properties, property];
          }

          modal.close();
        } catch (ex) {
          console.log(ex);
          this.toastrService.error(ex.message, 'Http Error', {
            timeOut: 5000,
            extendedTimeOut: 5000,
          });
        }
      }
    });
  }

  async onEdit(property: UnitedPropertyDto): Promise<void> {
    const modal = await this.openPropertyModal(property);

    modal.componentInstance.submitData.subscribe(async (prop: UnitedPropertyDto | null) => {
      if (prop) {
        try {
          const updatedProp = await this.assetApiService.updateAssetTypeProperty(
            property.id,
            this.assetTypeId,
            prop as any,
          );

          if (updatedProp) {
            this.properties = this.properties.map(p => (p.id === property.id ? updatedProp : p));
          }

          modal.close();
        } catch (ex) {
          console.log(ex);
          this.toastrService.error(ex.message, 'Http Error', {
            timeOut: 5000,
            extendedTimeOut: 5000,
          });
        }
      }
    });
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (confirmed) {
      try {
        await this.assetApiService.deleteAssetTypeProperty(id, this.assetTypeId);
        this.properties = this.properties.filter(p => p.id !== id);
      } catch (ex) {}
    }
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_PROPERTY_CONFIRM.TITLE',
      body: 'MODALS.DELETE_PROPERTY_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_PROPERTY_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_PROPERTY_CONFIRM.ABORT',
    };
    return modal.result;
  }

  private openPropertyModal(property?: UnitedPropertyDto): NgbModalRef {
    const modal = this.modalService.open(PropertyModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    if (property) {
      modal.componentInstance.mode = 'edit';
      modal.componentInstance.property = property;
    }

    return modal;
  }
}
