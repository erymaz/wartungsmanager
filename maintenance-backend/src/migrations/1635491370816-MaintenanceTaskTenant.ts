import {MigrationInterface, QueryRunner} from "typeorm";
import { TABLE_PREFIX } from '../definitions';

export class MaintenanceTaskTenant1635491370816 implements MigrationInterface {
    name = 'MaintenanceTaskTenant1635491370816';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER ALGORITHM=UNDEFINED DEFINER=CURRENT_USER SQL SECURITY DEFINER VIEW `' +
                TABLE_PREFIX +
                'maintenances_tasks` AS select `' +
                TABLE_PREFIX +
                'tasks`.`id` AS `id`,`' +
                TABLE_PREFIX +
                'tasks`.`tenant_id` AS `tenant_id`,`' +
                TABLE_PREFIX +
                'tasks`.`name` AS `name`,`' +
                TABLE_PREFIX +
                'tasks`.`responsible` AS `responsible`,`' +
                TABLE_PREFIX +
                'maintenances`.`due_date` AS `due_date`,`' +
                TABLE_PREFIX +
                'maintenances`.`machine_id` AS `machine_id`,`' +
                TABLE_PREFIX +
                'maintenances`.`title` AS `maintenance`,`' +
                TABLE_PREFIX +
                'maintenances`.`status` AS `status`,`' +
                TABLE_PREFIX +
                'maintenances`.`id` AS `maintenance_id` from (`' +
                TABLE_PREFIX +
                'tasks` left join `' +
                TABLE_PREFIX +
                'maintenances` on((`' +
                TABLE_PREFIX +
                'maintenances`.`id` = `' +
                TABLE_PREFIX +
                'tasks`.`maintenance_id`)))',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
