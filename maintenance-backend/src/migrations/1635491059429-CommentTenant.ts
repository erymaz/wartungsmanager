import {MigrationInterface, QueryRunner} from "typeorm";
import { TABLE_PREFIX } from '../definitions';

export class CommentTenant1635491059429 implements MigrationInterface {
    name = 'CommentTenant1635491059429';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`${TABLE_PREFIX}comments\` ADD \`tenant_id\` char(36) NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`${TABLE_PREFIX}comments\` DROP COLUMN \`tenant_id\``);
    }

}
