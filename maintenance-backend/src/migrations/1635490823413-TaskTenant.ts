import {MigrationInterface, QueryRunner} from "typeorm";
import { TABLE_PREFIX } from '../definitions';

export class TaskTenant1635490823413 implements MigrationInterface {
    name = 'TaskTenant1635490823413';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`${TABLE_PREFIX}tasks\` ADD \`tenant_id\` char(36) NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`${TABLE_PREFIX}tasks\` DROP COLUMN \`tenant_id\``);
    }

}
