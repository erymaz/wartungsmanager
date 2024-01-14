import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../entities/task.entity';
import { CommentService } from '../comment/comment.service';
import { Comment } from '../entities/comment.entity';

import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment])],
  controllers: [TaskController],
  providers: [TaskService, CommentService],
})
export class TaskModule {}
