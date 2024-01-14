import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class InitialFile1494753648830 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + 'files',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'maintenance_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_a47fb7183731aeece7241e2e4f4',
            columnNames: ['maintenance_id'],
            referencedTableName: TABLE_PREFIX + 'maintenances',
            referencedColumnNames: ['id'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(TABLE_PREFIX + 'files', true);
  }
}
