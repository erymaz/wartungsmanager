import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class InitialTaskEntity1494753374395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + 'tasks',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'completed',
            type: 'tinyint(4)',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'responsible',
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
            name: 'completed_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'is_internal',
            type: 'tinyint(4)',
            isNullable: false,
            default: 1,
          },
          {
            name: 'time_unit',
            type: 'decimal(10,0)',
            isNullable: false,
          },
          {
            name: 'position',
            type: 'decimal(10,0)',
            isNullable: false,
          },
          {
            name: 'target_time',
            type: 'decimal(10,0)',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_899606d812c0509974317f8e0b3',
            columnNames: ['maintenance_id'],
            referencedTableName: TABLE_PREFIX + 'maintenances',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          {
            name: 'IDX_20f1f21d6853d9d20d501636eb',
            columnNames: ['name'],
            isFulltext: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(TABLE_PREFIX + 'tasks', true);
  }
}
