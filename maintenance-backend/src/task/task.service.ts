import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

import { Task } from '../entities/task.entity';
import { CommentService } from '../comment/comment.service';
import { Document } from '../entities/document.entity';

export interface Filters {
  tenantId?: string;
  sorting?: {
    target: string;
    order: 'ASC' | 'DESC';
  };
  startDate?: Date;
  endDate?: Date;
  assetId?: string;
  status?: string;
  responsible?: string;
  searchString?: string;
  maintenanceId?: string;
  taskId?: string;
  isInternal?: string;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private commentService: CommentService,
  ) {}

  async getTask(id: string) {
    return await this.taskRepo.findOne({ id });
  }

  async getTasksByMaintenance(maintenanceId: string) {
    return await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('task.documents', 'documents')
      .leftJoinAndSelect('documents.file', 'file')
      .where('task.maintenance_id = :maintenanceId', { maintenanceId })
      .orderBy('task.position')
      .getMany();
  }

  async createTask(data: Task) {
    const task = this.taskRepo.create(data);
    await this.taskRepo.save(task);
    if (task.maintenance) {
      await this.updatePosition(task.maintenance.id, undefined, 0);
    }
    return await this.taskRepo.findOne({ id: task.id });
  }

  async updateTask(id: string, data: Task) {
    const task = await this.taskRepo.findOne({ id });

    const subjects = await this.taskRepo
      .createQueryBuilder()
      .relation(Task, 'documents')
      .of(id)
      .loadMany<Document>();

    await this.taskRepo
      .createQueryBuilder()
      .relation(Task, 'documents')
      .of(id)
      .addAndRemove(data.documents, subjects);

    const { documents, ...rest } = data;
    if (data.completed && !(task && task.completed)) {
      await this.taskRepo.update(id, {
        ...rest,
        completedDate: new Date(),
      });
    } else {
      await this.taskRepo.update(id, rest);
    }
    return await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('task.documents', 'documents')
      .where('task.id = :id', { id })
      .getOne();
  }

  async updatePosition(
    maintenanceId: string,
    prevPosition: number | undefined,
    nextPosition: number,
  ) {
    const task = await this.taskRepo.find({
      maintenance: { id: maintenanceId },
      position: prevPosition,
    });
    if (task.length === 0) {
      return;
    }
    const query = this.taskRepo.createQueryBuilder().update();
    if (prevPosition === undefined) {
      query.set({ position: () => 'position + 1' }).andWhere('position IS NOT NULL');
    } else if (nextPosition > prevPosition) {
      query
        .set({ position: () => 'position - 1' })
        .andWhere('position > :prevPosition', { prevPosition })
        .andWhere('position <= :nextPosition', { nextPosition });
    } else {
      query
        .set({ position: () => 'position + 1' })
        .andWhere('position < :prevPosition', { prevPosition })
        .andWhere('position >= :nextPosition', { nextPosition });
    }
    await query.andWhere('maintenance_id = :maintenanceId', { maintenanceId }).execute();
    await this.taskRepo.update(task[0].id, { position: nextPosition });
  }

  async deleteTask(id: string) {
    await this.commentService.deleteTaskComments(id);
    const task = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.maintenance', 'maintenance')
      .where('task.id = :id', { id })
      .getOne();
    if (!task) {
      return;
    }
    await this.taskRepo
      .createQueryBuilder()
      .update()
      .set({ position: () => 'position - 1' })
      .andWhere('maintenance_id = :id', { id: task.maintenance.id })
      .andWhere('position > :position', { position: task.position })
      .execute();
    return await this.taskRepo.delete({ id });
  }

  async getNotCompletedCount(maintenanceId: string) {
    return await this.taskRepo
      .createQueryBuilder()
      .where('maintenance_id = :maintenanceId', { maintenanceId })
      .andWhere('not(completed)')
      .getCount();
  }

  async getAllTasks(filters: Filters) {
    const sorting: { target: string; order: 'ASC' | 'DESC' } | false = JSON.parse(
      ((filters.sorting as unknown) as string) || 'false',
    );

    const query = this.taskRepo
      .createQueryBuilder('task')
      .select([
        'task.id as id',
        'task.name as name',
        'task.responsible as responsible',
        'maintenance.dueDate as dueDate',
        'maintenance.machineId as machineId',
        'maintenance.title as maintenance',
        'maintenance.status as status',
        'maintenance.id as maintenanceId',
      ])
      .leftJoin('task.maintenance', 'maintenance');

    TaskService.filterAllTasks(query, filters);

    if (filters.tenantId) {
      query.andWhere('task.tenant_id = :tenantId', { tenantId: filters.tenantId });
    }

    if (sorting) {
      query.orderBy(sorting.target, sorting.order);
    }

    const statuses = await TaskService.filterAllTasks(
      this.taskRepo
        .createQueryBuilder('task')
        .select(['maintenance.status as status', 'count(maintenance.status) as count'])
        .leftJoin('task.maintenance', 'maintenance'),
      { startDate: filters.startDate, endDate: filters.endDate },
    )
      .groupBy('status')
      .getRawMany();

    const assets = await TaskService.filterAllTasks(
      this.taskRepo
        .createQueryBuilder('task')
        .select(['maintenance.machineId as assetId', 'count(maintenance.machineId) as count'])
        .leftJoin('task.maintenance', 'maintenance'),
      { startDate: filters.startDate, endDate: filters.endDate },
    )
      .groupBy('assetId')
      .getRawMany();

    const responsible = await TaskService.filterAllTasks(
      this.taskRepo
        .createQueryBuilder('task')
        .select(['task.responsible as responsible', 'count(task.responsible) as count'])
        .leftJoin('task.maintenance', 'maintenance'),
      { startDate: filters.startDate, endDate: filters.endDate },
    )
      .groupBy('responsible')
      .getRawMany();

    return {
      statuses,
      assets,
      responsible,
      tasks: await query.getRawMany(),
    };
  }

  private static filterAllTasks(
    query: SelectQueryBuilder<Task>,
    filters: Filters,
  ): SelectQueryBuilder<Task> {
    if (filters.startDate) {
      query.andWhere('maintenance.dueDate >= :startDate', filters);
    }

    if (filters.endDate) {
      query.andWhere('maintenance.dueDate <= :endDate', filters);
    }

    if (filters.assetId) {
      query.andWhere('maintenance.machineId = :assetId', filters);
    }

    if (filters.responsible) {
      query.andWhere('task.responsible = :responsible', filters);
    }

    if (filters.status) {
      query.andWhere('maintenance.status = :status', filters);
    }

    if (filters.searchString) {
      query.andWhere(
        new Brackets(qb => {
          qb.where(
            `MATCH(task.name) AGAINST ('${filters.searchString}' IN BOOLEAN MODE)`,
          ).orWhere('task.name LIKE :name', { name: `%${filters.searchString}%` });
        }),
      );
    }

    return query;
  }
}
