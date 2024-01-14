import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TileConfigurationController } from './tile-configuration/tile-configuration.controller';
import { TileConfigurationEntity } from './tile-configuration/tile-configuration.entity';
import { TileConfigurationService } from './tile-configuration/tile-configuration.service';

@Module({
  imports: [TypeOrmModule.forFeature([TileConfigurationEntity])],
  controllers: [TileConfigurationController],
  providers: [TileConfigurationService],
})
export class TileConfigurationModule {}
