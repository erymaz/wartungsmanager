import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Task } from 'src/entities/task.entity';

import { Maintenance, MaintenanceStatus } from '../entities/maintenance.entity';
import { Filters, TaskService } from '../task/task.service';
import { Document } from '../entities/document.entity';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepo: Repository<Maintenance>,
    private taskService: TaskService,
  ) {
    this.checkStatusesEveryDay();
  }

  async getMaintenance(id: string) {
    const result = await this.maintenanceRepo
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.documents', 'document')
      .leftJoinAndSelect('document.file', 'file')
      .where('maintenance.id = :id', { id })
      .getOne();

    if (result) {
      result.plannedTime = (await this.getPlannedTime(id)).plannedTime;
      result.actuallySpendTime = (await this.getActuallySpendTime(id)).actuallySpendTime;
    }

    return result;
  }

  async getPlannedTime(id: string) {
    return await this.maintenanceRepo
      .createQueryBuilder('maintenance')
      .select('sum(task.targetTime * task.timeUnit) as plannedTime')
      .leftJoin('maintenance.tasks', 'task')
      .where('maintenance.id = :id', { id })
      .getRawOne();
  }

  async getActuallySpendTime(id: string) {
    return await this.maintenanceRepo
      .createQueryBuilder('maintenance')
      .select('sum(comment.duration * comment.time_unit) as actuallySpendTime')
      .leftJoin('maintenance.tasks', 'task')
      .leftJoin('task.comments', 'comment')
      .where('maintenance.id = :id', { id })
      .andWhere('task.completed IS TRUE')
      .getRawOne();
  }

  async getMaintenanceByMachine(machineId: string | string[], filters: Filters) {
    const query: SelectQueryBuilder<Maintenance> = this.maintenanceRepo
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.comments', 'comment')
      .leftJoinAndSelect('maintenance.documents', 'document')
      .leftJoinAndSelect('maintenance.tasks', 'tasks');

    if (filters.tenantId) {
      query.andWhere('maintenance.tenantId = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters.status !== 'completed') {
      query.andWhere('maintenance.completed IS NOT TRUE');
    }

    if (machineId) {
      if (typeof machineId === 'string') {
        query.andWhere('maintenance.machineId = :machineId', { machineId });
      } else {
        query.andWhere('maintenance.machineId in (:machineId)', { machineId });
      }
    }

    if (filters.status) {
      query.andWhere('maintenance.status = :status', filters);
    }
    if (filters.startDate) {
      query.andWhere('maintenance.dueDate >= :startDate', filters);
    }
    if (filters.endDate) {
      query.andWhere('maintenance.dueDate <= :endDate', filters);
    }
    if (filters.responsible) {
      query.andWhere('maintenance.responsible = :responsible', filters);
    }
    if (filters.assetId) {
      query.andWhere('maintenance.machineId = :assetId', filters);
    }
    if (filters.isInternal !== undefined) {
      if (filters.isInternal === 'true') {
        query.andWhere('maintenance.isInternal > 0');
      } else {
        query.andWhere(
          new Brackets(qb => {
            qb.where('maintenance.isInternal = 0').orWhere('tasks.isInternal = 0');
          }),
        );
      }
    }

    if (filters.sorting && filters.sorting.target !== 'tasks') {
      filters.sorting.target = filters.sorting.target.replace(/[A-Z]/g, '_' + '$&'.toLowerCase());
      query.orderBy(`ISNULL(maintenance.${filters.sorting.target})`, 'ASC');
      query.addOrderBy(`maintenance.${filters.sorting.target}`, filters.sorting.order);
    }

    if (!filters.sorting || (filters.sorting && filters.sorting.target !== 'status')) {
      query.addOrderBy('status', 'DESC');
    }

    const result = (await query.getRawAndEntities()).entities;

    if (filters.sorting && filters.sorting.target === 'tasks') {
      result.sort((a, b) =>
        a.tasks.length > b.tasks.length
          ? Number((filters.sorting || { order: 'ASC' }).order === 'ASC') * 2 - 1
          : Number((filters.sorting || { order: 'ASC' }).order === 'DESC') * 2 - 1,
      );
    }

    return await Promise.all(
      result.map(async ({ comments, ...maintenance }) => ({
        ...maintenance,
        comment: comments[0] || null,
        actuallySpendTime: (await this.getActuallySpendTime(maintenance.id)).actuallySpendTime,
      })),
    );
  }

  async createMaintenance(data: Maintenance) {
    const maintenance = this.maintenanceRepo.create(this.updateStatus(data));
    return await this.maintenanceRepo.save(maintenance);
  }

  async updateMaintenance(id: string, data: Maintenance): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepo.findOneOrFail(id);

    const subjects = await this.maintenanceRepo
      .createQueryBuilder()
      .relation(Maintenance, 'documents')
      .of(id)
      .loadMany<Maintenance>();

    await this.maintenanceRepo
      .createQueryBuilder()
      .relation(Maintenance, 'documents')
      .of(id)
      .addAndRemove(data.documents, subjects);

    await this.maintenanceRepo.save({
      id,
      ...this.updateStatus(
        { ...maintenance, ...data, documents: [] },
        maintenance ? maintenance.status : '',
      ),
    });
    const result = await this.maintenanceRepo
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.files', 'maintenance_files')
      .leftJoinAndSelect('maintenance.documents', 'document')
      .leftJoinAndSelect('document.file', 'file')
      .where('maintenance.id = :id', { id })
      .getOneOrFail();

    if (result) {
      result.plannedTime = (await this.getPlannedTime(data.id)).plannedTime;
      result.actuallySpendTime = (await this.getActuallySpendTime(data.id)).actuallySpendTime;
    }

    return result;
  }

  async deleteMaintenance(id: string) {
    try {
      await Promise.all(
        (await this.taskService.getTasksByMaintenance(id)).map(({ id: tId }) =>
          this.taskService.deleteTask(tId),
        ),
      );
    } catch (ex) {
      // temp hotfix
      // todo: use cascade
      await Promise.all(
        (await this.taskService.getTasksByMaintenance(id)).map(({ id: tId }) =>
          this.taskService.deleteTask(tId),
        ),
      );
    }

    return await this.maintenanceRepo.delete({ id });
  }

  async getSummarizeByMachine(machineId: string | string[], tenantId: string) {
    const queryStatuses = this.maintenanceRepo
      .createQueryBuilder()
      .select(['status', 'count(status) as count'])
      .where('completed IS NOT TRUE');

    const queryResponsible = this.maintenanceRepo
      .createQueryBuilder()
      .select(['responsible', 'count(responsible) as count'])
      .where('completed IS NOT TRUE');

    const queryAssets = this.maintenanceRepo
      .createQueryBuilder()
      .select(['machine_id as assetId', 'count(machine_id) as count'])
      .where('completed IS NOT TRUE');

    if (machineId) {
      if (typeof machineId === 'string') {
        queryStatuses.andWhere('machine_id = :machineId', { machineId });
        queryResponsible.andWhere('machine_id = :machineId', { machineId });
        queryAssets.andWhere('machine_id = :machineId', { machineId });
      } else {
        queryStatuses.andWhere('machine_id in (:machineId)', { machineId });
        queryResponsible.andWhere('machine_id in (:machineId)', { machineId });
        queryAssets.andWhere('machine_id in (:machineId)', { machineId });
      }
    }

    if (tenantId) {
      queryStatuses.andWhere('tenant_id = :tenantId', { tenantId });
      queryResponsible.andWhere('tenant_id = :tenantId', { tenantId });
      queryAssets.andWhere('tenant_id = :tenantId', { tenantId });
    }

    return {
      statuses: await queryStatuses.groupBy('status').getRawMany(),
      responsible: await queryResponsible.groupBy('responsible').getRawMany(),
      assets: await queryAssets.groupBy('assetId').getRawMany(),
    };
  }

  async completeMaintenance(id: string): Promise<Maintenance> {
    const notCompletedCount = await this.taskService.getNotCompletedCount(id);
    let maintenance: Maintenance = await this.maintenanceRepo
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.documents', 'document')
      .leftJoinAndSelect('document.file', 'file')
      .where('maintenance.id = :id', { id })
      .getOneOrFail();

    if (notCompletedCount > 0 || (maintenance && maintenance.earliestExecTime > new Date())) {
      return maintenance;
    }

    await this.maintenanceRepo.update(id, {
      completed: true,
      status: 'completed',
      completedAt: new Date(Date.now()),
    });

    maintenance = await this.maintenanceRepo
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.documents', 'documents')
      .leftJoinAndSelect('documents.file', 'file')
      .where('maintenance.id = :id', { id })
      .getOneOrFail();

    if (maintenance) {
      maintenance.plannedTime = (await this.getPlannedTime(id)).plannedTime;
      maintenance.actuallySpendTime = (await this.getActuallySpendTime(id)).actuallySpendTime;
    }

    // if maintenance interval is set -> create a new maintenance
    if (
      maintenance &&
      maintenance.interval &&
      maintenance.intervalUnit &&
      maintenance.earliestExecTime &&
      Number(maintenance.intervalUnit) !== 0 &&
      !maintenance.copied
    ) {
      const { id, createdAt, status, ...rest } = maintenance;

      const newDueDate = MaintenanceService.createDate(
        maintenance.dueDate,
        maintenance.interval,
        maintenance.intervalUnit,
      );
      const newEarliestExecTime = MaintenanceService.createDate(
        maintenance.earliestExecTime,
        maintenance.interval,
        maintenance.intervalUnit,
      );
      let copy = {
        ...rest,
        dueDate: newDueDate,
        earliestExecTime: newEarliestExecTime,
        completed: false,
      } as Maintenance;
      copy = this.updateStatus(copy as Maintenance) as Maintenance;
      const newMaintenance = await this.createMaintenance(copy);
      this.logger.log('[Interval]: Created new maintenance: ', JSON.stringify(newMaintenance));

      const tasks = await this.taskService.getTasksByMaintenance(id);
      const newTasks = tasks.map(task => ({
        completed: false,
        name: task.name,
        responsible: task.responsible,
        targetTime: task.targetTime,
        position: task.position,
        timeUnit: task.timeUnit,
        maintenance: newMaintenance.id,
      }));

      for (const newTask of newTasks) {
        await this.taskService.createTask((newTask as unknown) as Task);
        this.logger.log('[Interval]: Created new task: ', JSON.stringify(newTask));
      }
    }

    return maintenance;
  }

  private updateStatus(data: Maintenance, prevStatus?: string): Omit<Maintenance, 'id'> {
    const now = new Date();

    const maintenance = data;
    if (maintenance.dueDate && now > new Date(maintenance.dueDate)) {
      maintenance.status = 'overdue';
    } else if (maintenance.earliestExecTime && now > new Date(maintenance.earliestExecTime)) {
      maintenance.status = 'dueSoon';
    } else {
      maintenance.status = 'scheduled';
    }

    const { id, ...rest } = maintenance;
    return rest;
  }

  @Cron('1 1 0 */1 * *')
  private async checkStatusesEveryDay() {
    this.logger.log('Running cron job. Updating maintenances...');
    const now = new Date();

    let idsToUpdate: string[] = (
      await this.maintenanceRepo
        .createQueryBuilder()
        .select('id')
        .where('due_date IS NOT NULL')
        .andWhere('due_date < :now', { now })
        .andWhere('status <> "completed"')
        .andWhere('status <> "overdue"')
        .getRawMany()
    ).map(({ id }: { id: string }) => id);

    if (idsToUpdate.length > 0) {
      this.logger.log(`Changing ${idsToUpdate.length} maintenances to status [overdue]...`);
      await this.maintenanceRepo.update(idsToUpdate, { status: 'overdue' });
      const updatedMaintenances = await this.maintenanceRepo.findByIds(idsToUpdate);
      await Promise.all(
        updatedMaintenances.map(async (m: Maintenance) => {
          const maintenance = (await this.getMaintenance(m.id)) as Maintenance;
          await this.copyMaintenance(
            {
              ...maintenance,
              documents: maintenance.documents.map(({ id }) => ({ id })) as Document[],
              tasks: await this.taskService.getTasksByMaintenance(m.id),
            },
            true,
          );
        }),
      );
    }

    idsToUpdate = (
      await this.maintenanceRepo
        .createQueryBuilder()
        .select('id')
        .where('earliest_exec_time IS NOT NULL')
        .andWhere('earliest_exec_time < :now', { now })
        .andWhere('status = "scheduled"')
        .getRawMany()
    ).map(({ id }: { id: string }) => id);

    if (idsToUpdate.length > 0) {
      this.logger.log(`Changing ${idsToUpdate.length} maintenances to status [dueSoon]...`);
      await this.maintenanceRepo.update(idsToUpdate, { status: 'dueSoon' });
    }
  }

  async getMachinesWithStatus(status: string) {
    const result = await this.maintenanceRepo
      .createQueryBuilder()
      .select(['machine_id', 'status'])
      .where('status = :status', { status })
      .groupBy('machine_id')
      .getRawMany();

    return result.map((row: { machine_id: string; status: string }) => ({
      ...row,
      machineId: row.machine_id,
    }));
  }

  async copyMaintenance(maintenanceToCopy: Maintenance, withIntervalUpdates = false) {
    const parentId = maintenanceToCopy.id;
    const { id, completed, comments, ...rest } = maintenanceToCopy;

    rest.documents = rest.documents.filter(documentToCopy => !documentToCopy.archive);

    rest.tasks = (await Promise.all(
      rest.tasks.map(async ({ comments, id, ...taskToCopy }) => {
        taskToCopy.completed = false;
        taskToCopy.completedDate = null;
        const task = (await this.taskService.createTask(taskToCopy as Task)) as Task;
        return task;
      }),
    )) as Task[];

    if (withIntervalUpdates && rest.dueDate && rest.interval && rest.intervalUnit) {
      rest.dueDate = MaintenanceService.createDate(rest.dueDate, rest.interval, rest.intervalUnit);
      rest.earliestExecTime = MaintenanceService.createDate(
        rest.earliestExecTime,
        rest.interval,
        rest.intervalUnit,
      );
      await this.maintenanceRepo.update(parentId, { copied: true });
    }

    const maintenance = this.maintenanceRepo.create(rest);

    return await this.maintenanceRepo.save(this.updateStatus(maintenance));
  }

  static createDate(date: Date, interval: number, unit: number) {
    let nextDate = new Date(date.getTime() + interval * unit * 1000);
    while (nextDate.getUTCDay() % 6 === 0) {
      nextDate = new Date(nextDate.getTime() + 86400000);
    }
    return nextDate;
  }
}
