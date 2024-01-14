import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class rolesAcl1612185901948 implements MigrationInterface {
  name = 'rolesAcl1612185901948';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      TABLE_PREFIX + 'acl',
      new TableForeignKey({
        name: TABLE_PREFIX + 'acl' + '__' + 'roles' + '__role_id_FK',
        columnNames: ['role_id'],
        referencedTableName: TABLE_PREFIX + 'roles',
        referencedColumnNames: ['id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      TABLE_PREFIX + 'acl',
      TABLE_PREFIX + 'acl' + '__' + 'roles' + '__role_id_FK',
    );
  }
}
