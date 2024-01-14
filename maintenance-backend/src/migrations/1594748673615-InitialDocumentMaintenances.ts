import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class InitialDocumentMaintenances1594748673615 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + 'documents_maintenances',
        columns: [
          {
            name: 'document_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'maintenance_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_b99931286d525c69fcaa4e32aaf',
            columnNames: ['document_id'],
            referencedColumnNames: ['id'],
            referencedTableName: TABLE_PREFIX + 'documents',
            onDelete: 'CASCADE',
          },
          {
            name: 'FK_e1d3977da6de6916775174d3c2c',
            columnNames: ['maintenance_id'],
            referencedColumnNames: ['id'],
            referencedTableName: TABLE_PREFIX + 'maintenances',
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_b99931286d525c69fcaa4e32aa',
            columnNames: ['document_id'],
          },
          {
            name: 'IDX_e1d3977da6de6916775174d3c2',
            columnNames: ['maintenance_id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(TABLE_PREFIX + 'documents_maintenances', true);
  }
}
