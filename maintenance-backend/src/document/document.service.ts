import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { Cron } from '@nestjs/schedule';

import { Document } from '../entities/document.entity';
import { DocumentView } from '../entities/document-view.entity';
import { Maintenance } from '../entities/maintenance.entity';
import { Filters } from '../task/task.service';
import { Task } from '../entities/task.entity';
import { TABLE_PREFIX } from '../definitions';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(DocumentView)
    private documentView: Repository<DocumentView>,
    private connection: Connection,
  ) {}

  async createDocument(data: Document) {
    const document = this.documentRepo.create(data);
    await this.documentRepo.save(document);
    return await this.documentView.findOne({ id: document.id });
  }

  async updateDocument(id: string, data: Document) {
    await this.documentRepo.update({ id }, { title: data.title });

    await Promise.all(
      ['tasks', 'maintenances'].map(async relation => {
        if (!data[relation as keyof Document]) {
          return;
        }

        const subjects = await this.documentRepo
          .createQueryBuilder()
          .relation(Document, relation)
          .of(id)
          .loadMany();

        await this.documentRepo
          .createQueryBuilder()
          .relation(Document, relation)
          .of(id)
          .addAndRemove(data[relation as keyof Document], subjects);
      }),
    );

    return await this.documentView.findOne({ id });
  }

  async deleteDocument(id: string) {
    return await this.documentRepo.delete({ id });
  }

  async getDocuments(filters: Filters) {
    const query = this.documentView.createQueryBuilder('document');

    DocumentService.filterDocuments(query, filters);

    const assets = await this.connection
      .createQueryBuilder()
      .select(['maintenance.machine_id as assetId', `count(maintenance.machine_id) as count`])
      .from(Document, 'document')
      .leftJoin(TABLE_PREFIX + 'documents_maintenances', 'dm', 'dm.document_id = document.id')
      .leftJoin(TABLE_PREFIX + 'documents_tasks', 'dt', 'dt.document_id = document.id')
      .leftJoin(Task, 'task', 'task.id = dt.task_id')
      .innerJoin(
        Maintenance,
        'maintenance',
        'maintenance.id = task.maintenance_id OR dm.maintenance_id = maintenance.id',
      )
      .groupBy('maintenance.machine_id')
      .getRawMany();

    const maintenances = await this.connection
      .createQueryBuilder()
      .select([
        'maintenance.title as title',
        'maintenance.id as maintenanceId',
        'count(maintenance.id) as count',
      ])
      .from(Document, 'document')
      .leftJoin(TABLE_PREFIX + 'documents_maintenances', 'dm', 'dm.document_id = document.id')
      .leftJoin(TABLE_PREFIX + 'documents_tasks', 'dt', 'dt.document_id = document.id')
      .leftJoin(Task, 'task', 'task.id = dt.task_id')
      .innerJoin(
        Maintenance,
        'maintenance',
        'maintenance.id = dm.maintenance_id OR maintenance.id = task.maintenance_id',
      )
      .groupBy('maintenance.id')
      .getRawMany();

    const tasks = await this.connection
      .createQueryBuilder()
      .select(['task.name as name', 'task.id as taskId', 'count(task.id) as count'])
      .from(TABLE_PREFIX + 'documents_tasks', 'dt')
      .innerJoin(Task, 'task', 'task.id = dt.task_id')
      .groupBy('task.id')
      .getRawMany();

    return {
      documents: await query.getMany(),
      assets,
      maintenances,
      tasks,
    };
  }

  static filterDocuments(query: SelectQueryBuilder<DocumentView>, filters: Filters) {
    if (filters.tenantId) {
      query.andWhere('document.tenant_id = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters.searchString) {
      query.andWhere('document.title LIKE :title', { title: `%${filters.searchString}%` });
    }

    if (filters.maintenanceId || filters.assetId) {
      query
        .leftJoin(TABLE_PREFIX + 'documents_maintenances', 'dm', 'dm.document_id = document.id')
        .leftJoin(TABLE_PREFIX + 'documents_tasks', 'dt', 'dt.document_id = document.id')
        .leftJoin(Task, 'task', 'task.id = dt.task_id')
        .innerJoin(
          Maintenance,
          'maintenance',
          'maintenance.id = dm.maintenance_id OR maintenance.id = task.maintenance_id',
        );
    }

    if (filters.maintenanceId) {
      query.andWhere('maintenance.id = :maintenanceId', filters);
    }

    if (filters.assetId) {
      query.andWhere('maintenance.machine_id = :assetId', filters);
    }

    if (filters.taskId) {
      query
        .innerJoin(TABLE_PREFIX + 'documents_tasks', 'dt', 'dt.document_id = document.id')
        .innerJoin(Task, 'task', 'task.id = dtt.task_id')
        .andWhere('task.id = :taskId', filters);
    }
  }

  /*
    archived documents without any relation should be deleted
    because we can't attach existing archived documents from the front-end
  */
  @Cron('* 1 0 */1 * *')
  async cleanDocumentsEveryDay() {
    const documentsToDelete = await this.documentRepo
      .createQueryBuilder('document')
      .select(['document.id as id'])
      .leftJoin(TABLE_PREFIX + 'documents_maintenances', 'dm', 'dm.document_id = document.id')
      .leftJoin(TABLE_PREFIX + 'documents_tasks', 'dt', 'dt.document_id = document.id')
      .where('document.archive')
      .andWhere('dm.maintenance_id IS NULL')
      .andWhere('dt.task_id IS NULL')
      .groupBy('document.id')
      .getRawMany();

    if (documentsToDelete.length) {
      await this.documentRepo.delete(documentsToDelete.map(({ id }) => id));
    }
  }
}
