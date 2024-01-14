import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document } from '../entities/document.entity';
import { DocumentView } from '../entities/document-view.entity';

import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentView])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
