import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class addedFreeDataColumnForUsers1612960035712 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      TABLE_PREFIX + 'users',
      new TableColumn({
        name: 'free_data',
        type: 'varchar',
        isNullable: true,
        length: '10000',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(TABLE_PREFIX + 'users', 'free_data');
  }
}
