import { Module, HttpModule } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';

import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
