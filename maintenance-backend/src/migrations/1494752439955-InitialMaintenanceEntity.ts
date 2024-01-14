import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class InitialMaintenanceEntity1494752439955 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + 'maintenances',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'machine_id',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'due_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'earliest_exec_time',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'responsible',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'completed',
            type: 'tinyint(4)',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
            isNullable: false,
          },
          {
            name: 'copied',
            type: 'tinyint(4)',
            default: 0,
            isNullable: false,
          },
          {
            name: 'is_internal',
            type: 'tinyint(4)',
            default: 1,
            isNullable: false,
          },
          {
            name: 'due_at',
            type: 'decimal(10,0)',
            isNullable: true,
          },
          {
            name: 'earliest_processing',
            type: 'decimal(10,0)',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'interval_unit',
            type: 'decimal(10,0)',
            isNullable: true,
          },
          {
            name: 'use_operating_hours',
            type: 'tinyint(4)',
            default: 0,
            isNullable: false,
          },
          {
            name: 'interval',
            type: 'decimal(10,0)',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(TABLE_PREFIX + 'maintenances', true);
  }
}
