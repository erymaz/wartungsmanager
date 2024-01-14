import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class InitialDocumentTask1594749899558 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + 'documents_tasks',
        columns: [
          {
            name: 'document_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'task_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_7c4cc6551977995ec4f71538c7a',
            columnNames: ['document_id'],
            referencedColumnNames: ['id'],
            referencedTableName: TABLE_PREFIX + 'documents',
            onDelete: 'CASCADE',
          },
          {
            name: 'FK_e7bc5984de3e9316bb13b8424c6',
            columnNames: ['task_id'],
            referencedColumnNames: ['id'],
            referencedTableName: TABLE_PREFIX + 'tasks',
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_7c4cc6551977995ec4f71538c7',
            columnNames: ['document_id'],
          },
          {
            name: 'IDX_e7bc5984de3e9316bb13b8424c',
            columnNames: ['task_id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(TABLE_PREFIX + 'documents_tasks', true);
  }
}
