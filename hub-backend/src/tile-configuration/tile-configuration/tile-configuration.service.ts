import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { Connection, EntityManager } from 'typeorm';

import { CreateTileConfiguration } from './dto/CreateTileConfiguration';
import { TileConfigurationEntity } from './tile-configuration.entity';

@Injectable()
export class TileConfigurationService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}
  tileRepo = this.connection.getRepository<TileConfigurationEntity>(TileConfigurationEntity);

  async getTileConfigurations(authInfo: AuthInfo): Promise<TileConfigurationEntity[]> {
    const tiles = await this.tileRepo.find({
      order: { order: 'ASC' },
      where: {
        tenantId: authInfo.tenantId,
      },
    });
    return tiles;
  }

  async createTileConfiguration(
    authInfo: AuthInfo,
    createData: CreateTileConfiguration,
  ): Promise<TileConfigurationEntity> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      const tileRepo = entityManager.getRepository(TileConfigurationEntity);

      let order = createData.order;
      if (!createData.order) {
        const beforeElement = await tileRepo.find({
          order: { order: 'DESC' },
          take: 1,
          where: {
            tenantId: authInfo.tenantId,
          },
        });
        if (!beforeElement.length) {
          order = 1;
        } else {
          order = beforeElement[0].order + 1;
        }
      }
      return await tileRepo.save(
        {
          tileName: createData.tileName || '',
          desc: createData.desc || '',
          appUrl: createData.appUrl || '',
          iconUrl: createData.iconUrl || '',
          tileColor: createData.tileColor || '',
          tileTextColor: createData.tileTextColor || '',
          order,
          tenantId: authInfo.tenantId,
        },
        {
          // This makes sure we get the actual instance from the database back
          reload: true,
        },
      );
    });
  }

  async updateTileConfiguration(
    authInfo: AuthInfo,
    id: number,
    updateData: Partial<CreateTileConfiguration>,
  ): Promise<TileConfigurationEntity> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      const tileRepo = entityManager.getRepository(TileConfigurationEntity);

      const tileConfiguration = await tileRepo.findOne({ id, tenantId: authInfo.tenantId });
      if (!tileConfiguration) {
        throw new NotFoundException(`Tile Configuration ${id} not found`);
      }

      await this.tileRepo.update({ id, tenantId: authInfo.tenantId }, updateData);

      const keys = Object.keys(updateData);

      keys.forEach(key => {
        (tileConfiguration[key as keyof TileConfigurationEntity] as string | number) = updateData[
          key as keyof CreateTileConfiguration
        ] as string | number;
      });

      return tileConfiguration;
    });
  }

  async deleteTileConfiguration(authInfo: AuthInfo, id: number): Promise<boolean> {
    try {
      await this.tileRepo.delete({ id, tenantId: authInfo.tenantId });
      return true;
    } catch (e) {
      return false;
    }
  }

  async changePosition(
    authInfo: AuthInfo,
    fromId: number,
    toId: number,
  ): Promise<TileConfigurationEntity> {
    const fromElement = await this.tileRepo.findOne({ id: fromId, tenantId: authInfo.tenantId });
    const toElement = await this.tileRepo.findOne({ id: toId, tenantId: authInfo.tenantId });

    if (!fromElement || !toElement) {
      throw new NotFoundException(
        `One of properties (or both) with ${fromId} or ${toId} id does not exist.`,
      );
    }

    await this.tileRepo.update(
      { id: fromId, tenantId: authInfo.tenantId },
      { order: toElement.order },
    );
    await this.tileRepo.update(
      { id: toId, tenantId: authInfo.tenantId },
      { order: fromElement.order },
    );

    const fromElementOrder = fromElement.order;
    fromElement.order = toElement.order;
    toElement.order = fromElementOrder;

    return fromElement;
  }
}
