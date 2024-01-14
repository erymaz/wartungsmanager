import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class usersRoles1611932662244 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_PREFIX + 'users_roles',
        columns: [
          {
            name: 'user_id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'role_id',
            type: 'varchar',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys(TABLE_PREFIX + 'users_roles', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: TABLE_PREFIX + 'users',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: TABLE_PREFIX + 'roles',
        referencedColumnNames: ['id'],
      }),
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TABLE_PREFIX + 'users_roles');
  }
}
