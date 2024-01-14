import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class InitialDocumentEntity1594746827014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + 'documents',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'created_at',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'archive',
            type: 'tinyint(4)',
            isNullable: false,
            default: 0,
          },
          {
            name: 'ext',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'file_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_b9e7d1916962b81f2c3b5b54804',
            columnNames: ['file_id'],
            referencedTableName: TABLE_PREFIX + 'files',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          {
            name: 'IDX_39d28d83a120557f479cc0fd39',
            columnNames: ['title'],
            isFulltext: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(TABLE_PREFIX + 'documents', true);
  }
}
