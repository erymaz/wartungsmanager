import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeneralController } from './general/general.controller';
import { GeneralEntity } from './general/general.entity';
import { GeneralService } from './general/general.service';
@Module({
  imports: [TypeOrmModule.forFeature([GeneralEntity])],
  controllers: [GeneralController],
  providers: [GeneralService],
})
export class GeneralSettingModule {}
