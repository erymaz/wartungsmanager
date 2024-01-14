import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class addedPasswordResetTokenForUsers1613115533041 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      TABLE_PREFIX + 'users',
      new TableColumn({
        name: 'reset_password_token',
        type: 'varchar',
        isNullable: true,
        length: '255',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(TABLE_PREFIX + 'users', 'reset_password_token');
  }
}
