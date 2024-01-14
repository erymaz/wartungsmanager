import {MigrationInterface, QueryRunner} from "typeorm";
import { TABLE_PREFIX } from '../definitions';

export class MaintenanceTenant1635491532023 implements MigrationInterface {
    name = 'MaintenanceTenant1635491532023';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`${TABLE_PREFIX}maintenances\` ADD \`tenant_id\` char(36) NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`${TABLE_PREFIX}maintenances\` DROP COLUMN \`tenant_id\``);
    }

}
