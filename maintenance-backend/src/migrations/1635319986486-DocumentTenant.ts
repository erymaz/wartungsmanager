import { MigrationInterface, QueryRunner } from 'typeorm';
import { TABLE_PREFIX } from '../definitions';

export class DocumentTenant1635319986486 implements MigrationInterface {
  name = 'DocumentTenant1635319986486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`${TABLE_PREFIX}documents\` ADD \`tenant_id\` char(36) NOT NULL`,
      );
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE \`${TABLE_PREFIX}documents\` DROP COLUMN \`tenant_id\``);
  }
}
