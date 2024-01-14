import { MigrationInterface, QueryRunner } from 'typeorm';

import { TABLE_PREFIX } from '../../src/definitions';

export class DocumentView1595822310254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE ALGORITHM=UNDEFINED DEFINER=CURRENT_USER SQL SECURITY DEFINER VIEW `' +
        TABLE_PREFIX +
        'documents_view` AS select `' +
        TABLE_PREFIX +
        'documents`.`id` AS `id`,`' +
        TABLE_PREFIX +
        'documents`.`title` AS `title`,`' +
        TABLE_PREFIX +
        'documents`.`ext` AS `ext`,`' +
        TABLE_PREFIX +
        'documents`.`created_at` AS `created_at`,`' +
        TABLE_PREFIX +
        "documents`.`archive` AS `archive`,concat('[',group_concat('{','\"id\":\"',`mt`.`id`,'\",','\"name\":\"',ifnull(`mt`.`name`,''),'\",','\"machineId\":\"',ifnull(`mt`.`machine_id`,''),'\"','}' separator ','),']') AS `tasks`,concat('[',group_concat('{','\"id\":\"',`m`.`id`,'\",','\"machineId\":\"',ifnull(`m`.`machine_id`,''),'\",','\"title\":\"',ifnull(`m`.`title`,''),'\"','}' separator ','),']') AS `maintenances`,concat('{','\"id\":\"',`" +
        TABLE_PREFIX +
        'files`.`id`,\'",\',\'"name":"\',ifnull(`' +
        TABLE_PREFIX +
        "files`.`name`,''),'\"','}') AS `file` from (((((`" +
        TABLE_PREFIX +
        'documents` left join `' +
        TABLE_PREFIX +
        'documents_tasks` `dtt` on((`dtt`.`document_id` = `' +
        TABLE_PREFIX +
        'documents`.`id`))) left join `' +
        TABLE_PREFIX +
        'documents_maintenances` `dmm` on((`dmm`.`document_id` = `' +
        TABLE_PREFIX +
        'documents`.`id`))) left join `' +
        TABLE_PREFIX +
        'maintenances_tasks` `mt` on((`mt`.`id` = `dtt`.`task_id`))) left join `' +
        TABLE_PREFIX +
        'maintenances` `m` on((`m`.`id` = `dmm`.`maintenance_id`))) join `' +
        TABLE_PREFIX +
        'files` on((`' +
        TABLE_PREFIX +
        'files`.`id` = `' +
        TABLE_PREFIX +
        'documents`.`file_id`))) group by `' +
        TABLE_PREFIX +
        'documents`.`id`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
