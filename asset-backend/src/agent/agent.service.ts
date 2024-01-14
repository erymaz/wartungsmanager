import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  AssetDto,
  AssetPropertyType,
  CUSTOMER_PROP_KEY,
  DEVICE_PROP_KEY,
  DISTANCE_PROP_KEY,
  ISA95EquipmentHierarchyModelElement,
  MultilangValue,
  OPERATING_HOURS_PROP_KEY,
  STROKES_PROP_KEY,
  UnitedPropertyDto,
} from 'shared/common/models';

import { AssetEntity } from '../asset/asset.entity';
import { AssetService } from '../asset/asset.service';
import { AssetPropertyService } from '../asset-property/asset-property.service';
import { CreatePropertyDefReqDto } from '../asset-property/dto/CreatePropertyDefReqDto';
import { AssetTypeEntity } from '../asset-type/asset-type.entity';
import { AssetTypeService } from '../asset-type/asset-type.service';

interface ValueReturn {
  deviceId: string;
  value: number;
  property: string;
}

const PROPS: Array<{ key: string; name: MultilangValue; type: AssetPropertyType }> = [
  {
    key: DEVICE_PROP_KEY,
    name: { en_EN: 'Device ID', de_DE: 'Geräte ID' },
    type: AssetPropertyType.STRING,
  },
  {
    key: CUSTOMER_PROP_KEY,
    name: { en_EN: 'Customer ID', de_DE: 'Kunden ID' },
    type: AssetPropertyType.STRING,
  },
  {
    key: OPERATING_HOURS_PROP_KEY,
    name: { en_EN: 'Operating hours', de_DE: 'Betriebsstunden' },
    type: AssetPropertyType.NUMBER,
  },
  {
    key: DISTANCE_PROP_KEY,
    name: { en_EN: 'Distance', de_DE: 'Distanz' },
    type: AssetPropertyType.NUMBER,
  },
  {
    key: STROKES_PROP_KEY,
    name: { en_EN: 'Stokes', de_DE: 'Hübe' },
    type: AssetPropertyType.NUMBER,
  },
];

let operatingHours = 0;
let distance = 0;
let strokes = 0;

@Injectable()
export class AgentService implements OnModuleInit {
  constructor(
    private readonly assetService: AssetService,
    private readonly assetTypeService: AssetTypeService,
    private readonly propertyService: AssetPropertyService,
    @InjectLogger(AgentService.name)
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    await this.ensurePropsExist();
    await this.runTask();
  }

  @Cron('*/30 * * * *')
  async runTask() {
    // This should run whenever asset properties are requested for a tenant.
    // However we dont want to add this to the core logic to keep compatibility.
    await this.ensurePropsExist();

    const entities = await this.assetService.find({
      relations: ['assetType', 'properties', 'properties.definition'],
    });
    const assets = entities.reduce((prev, curr) => {
      const asset = AssetEntity.toExternal(curr);
      const deviceId = this.findDeviceProp(asset.properties || []);
      const customerId = this.findCustomerProp(asset.properties || []);
      if (typeof deviceId === 'string' && typeof customerId === 'string') {
        return [...prev, { ...asset, deviceId, customerId }];
      }
      return prev;
    }, [] as Array<AssetDto & { deviceId: string; customerId: string }>);

    const results = await Promise.all(
      assets.map(({ deviceId, customerId }) =>
        this.getDeviceProps(customerId, deviceId).then(items =>
          items.reduce((prev, curr) => [...prev, { ...curr, deviceId }], [] as ValueReturn[]),
        ),
      ),
    );

    if (results.length) {
      this.logger.info(`Found ${results.length} devices to update`);
      this.logger.info('Updating these values:', results);

      const map = results
        .reduce((prev, curr) => [...prev, ...curr], [])
        .reduce((prev, curr) => {
          const entry = prev[curr.deviceId] || [];
          return {
            ...prev,
            [curr.deviceId]: [...entry, { property: curr.property, value: curr.value }],
          };
        }, {} as Record<string, Array<Omit<ValueReturn, 'deviceId'>>>);

      // Produce an array containing asset, the property and the new value.
      const props = Object.entries(map).reduce((prev, [deviceId, values]) => {
        // Find asset for which device we have value updates.
        const asset = assets.find(a => this.findDeviceProp(a.properties || []) === deviceId);
        if (!asset) {
          return prev;
        }

        // Match updates values with property key to get the property id.
        const propsWithValues = (asset.properties || []).reduce((p, curr) => {
          const entry = values.find(v => v.property === curr.key);
          if (entry) {
            return [...p, { propId: curr.id, value: entry.value }];
          }
          return p;
        }, [] as Array<{ propId: string; value: number }>);

        return [...prev, ...propsWithValues.map(propsWithValue => ({ asset, ...propsWithValue }))];
      }, [] as Array<{ asset: AssetDto; propId: string; value: number }>);

      await Promise.all(
        props.map(p =>
          this.propertyService.patchPropertyByIdAndAssetIdRaw(p.propId, p.asset.id, {
            value: p.value,
          }),
        ),
      );
    }
  }

  private async getDeviceProps(customerId: string, deviceId: string) {
    operatingHours += 0.5;
    distance += Math.floor(Math.random() * 10) / 10;
    strokes += Math.floor(Math.random() * 1000);

    return [
      {
        value: Math.floor(operatingHours),
        property: OPERATING_HOURS_PROP_KEY,
      },
      {
        value: distance,
        property: DISTANCE_PROP_KEY,
      },
      {
        value: strokes,
        property: STROKES_PROP_KEY,
      },
    ];
  }

  private async ensurePropsExist() {
    const assetTypes = await this.assetTypeService.find({
      where: {
        isBuiltIn: true,
        equipmentType: ISA95EquipmentHierarchyModelElement.PRODUCTION_UNIT,
      },
      relations: ['properties'],
    });
    const map = new Map<string, AssetTypeEntity>(assetTypes.map(t => [t.tenantId, t]));

    const props = [...map.values()].reduce((prev, curr) => {
      const newProps = PROPS.filter(({ key }) => !curr.properties.some(p => p.key === key)).map<
        CreatePropertyDefReqDto & { assetTypeId: string; tenantId: string }
      >((prop, position) => ({
        ...prop,
        position,
        isHidden: true,
        isRequired: false,
        value: prop.type === AssetPropertyType.NUMBER ? 0 : '',
        assetTypeId: curr.id,
        tenantId: curr.tenantId,
      }));
      return [...prev, ...newProps];
    }, [] as Array<CreatePropertyDefReqDto & { assetTypeId: string; tenantId: string }>);

    if (props.length) {
      this.logger.info(`Creating agent properties for tenants:`, [
        ...new Set(props.map(p => p.tenantId)),
      ]);

      await Promise.all(
        props.map(({ assetTypeId, ...prop }) =>
          this.propertyService.createPropertyForTenant(prop.tenantId, prop, assetTypeId),
        ),
      );
    }
  }

  private findDeviceProp(props: UnitedPropertyDto[]) {
    const prop = props.find(p => p.key === DEVICE_PROP_KEY && typeof p.value === 'string');
    return prop?.value;
  }

  private findCustomerProp(props: UnitedPropertyDto[]) {
    const prop = props.find(p => p.key === CUSTOMER_PROP_KEY && typeof p.value === 'string');
    return prop?.value;
  }
}
