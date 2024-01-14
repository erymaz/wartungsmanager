import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AssetDto, AssetTypeDto, UnitedPropertyDto, AssetTreeNodeDto } from 'shared/common/models';
import { environment } from 'src/environments/environment';

import { ActivityLog, DataResponse } from '../models';

import { AbstractApiService } from './abstract-api-service.service';

@Injectable({ providedIn: 'root' })
export class AssetApiService extends AbstractApiService {
  constructor(protected readonly http: HttpClient, protected readonly toastrService: ToastrService) {
    super(environment.assetServiceUrl, http, toastrService);
  }

  async getAssetTypeProperties(id: string): Promise<UnitedPropertyDto[]> {
    const res = await this.get<DataResponse<UnitedPropertyDto[]>>(
      `/v1/properties/asset-type/${id}`,
    );
    return res.body?.data || [];
  }

  async getAssetTypes(): Promise<AssetTypeDto[]> {
    const res = await this.get<DataResponse<AssetTypeDto[]>>('/v1/asset-types');
    return res.body?.data || [];
  }

  async getAssetType(id: string): Promise<AssetTypeDto | null> {
    const res = await this.get<DataResponse<AssetTypeDto>>(`/v1/asset-types/${id}`);
    return res.body?.data || null;
  }

  async getAssetActivities(id: string): Promise<ActivityLog[]> {
    const res = await this.get<DataResponse<ActivityLog[]>>('/v1/activity-logs', {
      params: {
        refId: id,
        objectType: 'asset',
      },
    });
    return res.body?.data || [];
  }

  async getAsset(id: string): Promise<AssetDto | null> {
    const res = await this.get<DataResponse<AssetDto>>(`/v1/assets/${id}`);
    return res.body?.data || null;
  }

  async getAssetTree(): Promise<AssetTreeNodeDto[]> {
    const res = await this.get<DataResponse<AssetTreeNodeDto[]>>('/v1/tree');
    return res.body?.data || [];
  }

  async getAssetProperties(id: string): Promise<UnitedPropertyDto[] | null> {
    const res = await this.get<DataResponse<UnitedPropertyDto[]>>(`/v1/properties/asset/${id}`);
    return res.body?.data || null;
  }

  async getUnassignedAssets(): Promise<AssetDto[]> {
    const res = await this.get<DataResponse<AssetTreeNodeDto[]>>('/v1/assets/unassigned');
    return res.body?.data || [];
  }

  async transform(id: string, parentId: string | null, order?: string[]): Promise<void> {
    const action = { id, type: 'childOf', childOf: parentId, order };
    await this.post<DataResponse<void>>('/v1/tree/transform', { actions: [action] });
  }

  async transformMany(ids: string[], parentId: string | null, order?: string[]): Promise<void> {
    const actions = ids.map(id => ({ id, type: 'childOf', childOf: parentId, order }));
    await this.post<DataResponse<void>>('/v1/tree/transform', { actions });
  }

  async updateAsset(id: string, asset: Partial<AssetDto>): Promise<AssetDto | null> {
    const res = await this.patch<DataResponse<AssetDto>>(`/v1/assets/${id}`, asset);
    return res.body?.data || null;
  }

  async updateAssetProperty(
    assetId: string,
    propertyId: string,
    propertyData: Partial<UnitedPropertyDto>,
  ): Promise<UnitedPropertyDto | null> {
    const res = await this.patch<DataResponse<UnitedPropertyDto>>(
      `/v1/properties/${propertyId}/asset/${assetId}`,
      propertyData,
    );

    return res.body?.data || null;
  }

  async createAsset(asset: Partial<AssetDto>): Promise<AssetDto | null> {
    const res = await this.post<DataResponse<AssetDto>>(`/v1/assets`, asset);
    return res.body?.data || null;
  }

  async updateAssetType(
    id: string,
    assetType: Partial<AssetTypeDto>,
  ): Promise<AssetTypeDto | null> {
    const res = await this.patch<DataResponse<AssetTypeDto>>(`/v1/asset-types/${id}`, assetType);
    return res.body?.data || null;
  }

  async createAssetType(assetType: Partial<AssetTypeDto>): Promise<AssetTypeDto | null> {
    const res = await this.post<DataResponse<AssetTypeDto>>(`/v1/asset-types`, assetType);
    return res.body?.data || null;
  }

  async updateAssetTypeProperty(
    propertyId: string,
    assetTypeId: string,
    property: Partial<UnitedPropertyDto>,
  ): Promise<UnitedPropertyDto | null> {
    const res = await this.patch<DataResponse<UnitedPropertyDto>>(
      `/v1/properties/${propertyId}/asset-type/${assetTypeId}`,
      property,
    );
    return res.body?.data || null;
  }

  async createAssetTypeProperty(
    assetTypeId: string,
    property: Partial<UnitedPropertyDto>,
  ): Promise<UnitedPropertyDto | null> {
    const res = await this.post<DataResponse<UnitedPropertyDto>>(
      `/v1/properties/asset-type/${assetTypeId}`,
      property,
    );
    return res.body?.data || null;
  }

  async deallocate(id: string, parentId: string | null): Promise<void> {
    const action = { id, type: 'delete', childOf: parentId };
    await this.post<DataResponse<void>>('/v1/tree/transform', { actions: [action] });
  }

  async deleteAsset(id: string): Promise<void> {
    await this.delete(`/v1/assets/${id}`);
  }

  async deleteAssetType(id: string): Promise<void> {
    await this.delete(`/v1/asset-types/${id}`);
  }

  async deleteAssetTypeProperty(propertyId: string, assetTypeId: string): Promise<void> {
    const res = await this.delete(`/v1/properties/${propertyId}/asset-type/${assetTypeId}`);
  }
}
