import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UnitedPropertyDto } from 'shared/common/models';
import { AssetApiService } from 'src/app/shared/services/asset-api.service';

@Component({
  selector: 'app-asset-dynamic-properties',
  templateUrl: './asset-dynamic-properties.component.html',
  styleUrls: ['./asset-dynamic-properties.component.scss'],
})
export class AssetDynamicPropertiesComponent implements OnInit {
  @Input() assetId!: string | null;

  properties: UnitedPropertyDto[] = [];
  changedProperties: {
    value?: string | number | boolean | Date | null;
    position: number | null;
    id: string;
  }[] = [];

  inputControl = new FormControl('');

  @Output() setChangedProperties = new EventEmitter();

  constructor(private assetApiService: AssetApiService) {}

  ngOnInit(): void {
    this.getDynamicProperties();
  }

  async getDynamicProperties() {
    if (!this.assetId) return;

    const properties = await this.assetApiService.getAssetProperties(this.assetId);
    this.properties = properties
      ? properties.sort((a, b) => (a.position || 0) - (b.position || 0))
      : [];
  }

  async changePosition(event: CdkDragDrop<any, UnitedPropertyDto>) {
    if (!this.assetId) return;

    const { currentIndex, previousIndex } = event;
    const prevItem = this.properties.find((property, i) => i === event.previousIndex);
    const currItem = this.properties.find((property, i) => i === event.currentIndex);

    if (!currItem || !prevItem) return;

    const propertiesCache = [...this.properties];
    propertiesCache[currentIndex] = { ...prevItem };
    propertiesCache[previousIndex] = { ...currItem };

    this.properties = propertiesCache;

    this.setItemToUpdateArray({
      ...prevItem,
      position: currItem.position,
    });

    this.setItemToUpdateArray({
      ...currItem,
      position: prevItem.position,
    });
  }

  setInputPropertyFocus(event: any, property: UnitedPropertyDto) {
    event.target.value = property.value || '';
  }

  changeInputProperty(event: any, property: UnitedPropertyDto) {
    this.setItemToUpdateArray({
      ...property,
      value: event.target.value || property.value,
    });
  }

  setItemToUpdateArray(property: Partial<UnitedPropertyDto>) {
    if (!property.id) return;

    const isPropertyWasChanged = this.changedProperties.find(item => item.id === property.id);

    if (!isPropertyWasChanged) {
      this.changedProperties.push({
        value: property.value,
        position: property.position || 0,
        id: property.id,
      });
    } else {
      isPropertyWasChanged.position = property.position || 0;
      isPropertyWasChanged.value = property.value;
    }

    this.setChangedProperties.emit(this.changedProperties);
  }
}
