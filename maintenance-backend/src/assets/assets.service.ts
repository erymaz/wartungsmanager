/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, HttpService, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { DataResponse } from 'shared/nestjs';
import {
  AssetDto,
  AssetTreeNodeDto,
  UnitedPropertyDto,
  CreateUnitedPropertyDto,
  ISA95EquipmentHierarchyModelElement,
  OPERATING_HOURS_PROP_KEY,
} from 'shared/common/models';

import NodeCache = require('node-cache');
import { AuthInfo } from 'shared/common/types';

import { ConfigService } from '../config/config.service';

import { AssetPropertyType } from 'shared/common/models';

@Injectable()
export class AssetsService {
  private cache = new NodeCache({ stdTTL: 30, checkperiod: 20 });
  private readonly logger = new Logger(AssetsService.name);
  private serviceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceUrl = this.configService.assetServiceUrl;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getTree(auth: AuthInfo): Promise<AssetTreeNodeDto[]> {
    const treeCacheKey = `tree_${auth.tenantId}`;
    const cachedTree = this.cache.get(treeCacheKey);
    if (cachedTree) {
      this.logger.debug('Getting tree from cache.');
      return cachedTree as AssetTreeNodeDto[];
    }
    this.logger.debug(`Fetching asset tree from ${this.serviceUrl}/v1/tree`);
    try {
      const opts = this.configService.getRequestHeader(auth);
      const treeRaw = (
        await this.httpService
          .get<DataResponse<AssetTreeNodeDto[]>>(`${this.serviceUrl}/v1/tree`, opts)
          .pipe()
          .toPromise()
      ).data.data;

      const tree = this.augmentTree(treeRaw);

      this.cache.set(treeCacheKey, tree);
      return tree;
    } catch (ex) {
      this.logger.error(`Error fetching asset tree! ${ex}`);
      throw new HttpException('Could not fetch asset tree', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private augmentTree(input: AssetTreeNodeDto[]): AssetTreeNodeDto[] {
    function traverse(element: any, level: number) {
      element.level = level.toString();
      for (const child of element.children) {
        traverse(child, level + 1);
      }
    }

    const tree = input;
    for (const rootElement of tree) {
      traverse(rootElement, 0);
    }
    return tree;
  }

  async getMachines(auth: AuthInfo): Promise<AssetDto[]> {
    const tree = await this.getTree(auth);
    return this.getMachinesFromTree(tree);
  }

  // after completion of a maintenance
  // maintenance hours can be set and are updated in FactoryChat
  async setOperatingHours(assetId: string, hours: string, auth: AuthInfo): Promise<string | void> {
    try {
      this.logger.log(`setting operating hours for ${assetId}: ${hours} hours ...`);
      const opts = this.configService.getRequestHeader(auth);
      const { assetType } = (
        await this.httpService
          .get<DataResponse<AssetDto>>(`${this.serviceUrl}/v1/assets/${assetId}`, opts)
          .toPromise()
      ).data.data;

      if (!assetType) {
        return;
      }

      // get current properties
      const properties = (
        await this.httpService
          .get<DataResponse<UnitedPropertyDto[]>>(
            `${this.serviceUrl}/v1/properties/asset/${assetId}`,
            opts,
          )
          .toPromise()
      ).data.data;

      const prop = this.updatePropertyArr(properties, hours);
      this.logger.log(`updated properties: ${JSON.stringify(prop)}`);

      if ('id' in prop && !!prop.id) {
        await this.httpService
          .patch(`${this.serviceUrl}/v1/properties/${prop.id}/asset/${assetId}`, prop, opts)
          .toPromise();
      } else {
        await this.httpService
          .post(`${this.serviceUrl}/v1/properties/asset-type/${assetType.id}`, prop, opts)
          .toPromise();
      }
      this.cache.flushAll();
      return hours;
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  updatePropertyArr(
    properties: (UnitedPropertyDto | CreateUnitedPropertyDto)[],
    value: string,
  ): UnitedPropertyDto | CreateUnitedPropertyDto {
    const index = properties.findIndex(prop => prop.key === OPERATING_HOURS_PROP_KEY);
    const hours = isNaN(Number(value)) ? 0 : Number(value);
    if (index > -1) {
      return { ...properties[index], value: hours };
    } else {
      return {
        name: { en_EN: 'Operating hours', de_DE: 'Betriebsstunden' },
        key: OPERATING_HOURS_PROP_KEY,
        value: hours,
        isHidden: false,
        isRequired: false,
        position: 0,
        type: AssetPropertyType.NUMBER,
        meta: {
          isOverwritten: false,
          fieldsOverwritten: [],
          isForeignAssetType: false,
          originAssetType: '',
        },
      } as CreateUnitedPropertyDto;
    }
  }

  private getMachinesFromTree(tree: AssetTreeNodeDto[]): AssetDto[] {
    const machines: AssetDto[] = [];

    function traverseTree(treeElement: AssetTreeNodeDto) {
      if (
        treeElement.assetType?.equipmentType === ISA95EquipmentHierarchyModelElement.PRODUCTION_UNIT
      ) {
        machines.push(treeElement);
      }
      for (const child of treeElement.children) {
        traverseTree(child);
      }
    }

    for (const rootElement of tree) {
      traverseTree(rootElement);
    }

    return machines;
  }
}
