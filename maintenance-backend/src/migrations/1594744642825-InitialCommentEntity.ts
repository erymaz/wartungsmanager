import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class InitialCommentEntity1594744642825 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + `comments`,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'duration',
            type: 'decimal(10,0)',
            isNullable: false,
          },
          {
            name: 'time_unit',
            type: 'decimal(10,0)',
            isNullable: false,
            default: 1,
          },
          {
            name: 'responsible',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'maintenance_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'task_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_b0e5f483f07245f270b92a832ed',
            columnNames: ['maintenance_id'],
            referencedTableName: TABLE_PREFIX + 'maintenances',
            referencedColumnNames: ['id'],
          },
          {
            name: 'FK_91256732111f039be6b212d96cd',
            columnNames: ['task_id'],
            referencedTableName: TABLE_PREFIX + 'tasks',
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(TABLE_PREFIX + 'comments', true);
  }
}
