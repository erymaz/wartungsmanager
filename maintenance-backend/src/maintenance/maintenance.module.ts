import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Maintenance } from '../entities/maintenance.entity';
import { Task } from '../entities/task.entity';
import { TaskService } from '../task/task.service';
import { CommentService } from '../comment/comment.service';
import { Comment } from '../entities/comment.entity';
import { Document } from '../entities/document.entity';
import { DocumentService } from '../document/document.service';
import { DocumentView } from '../entities/document-view.entity';
import { ConfigModule } from '../config/config.module';

import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maintenance, Task, Comment, Document, DocumentView]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, TaskService, CommentService, DocumentService],
})
export class MaintenanceModule {}
