import {MigrationInterface, QueryRunner} from "typeorm";
import { TABLE_PREFIX } from '../definitions';

export class FileTenant1635491216880 implements MigrationInterface {
    name = 'FileTenant1635491216880';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`${TABLE_PREFIX}files\` ADD \`tenant_id\` char(36) NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`${TABLE_PREFIX}files\` DROP COLUMN \`tenant_id\``);
    }

}
