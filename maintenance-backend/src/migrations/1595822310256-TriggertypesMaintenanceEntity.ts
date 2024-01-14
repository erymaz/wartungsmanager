import { MigrationInterface, QueryRunner,  TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class TriggertypesMaintenanceEntity1595822310256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.addColumns(TABLE_PREFIX + 'maintenances', [
      new TableColumn({
        name: 'use_distance',
        type: 'tinyint(4)',
        default: 0,
        isNullable: false,
      }),
      new TableColumn({
        name: 'use_strokes',
        type: 'tinyint(4)',
        default: 0,
        isNullable: false,
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropColumns(TABLE_PREFIX + 'maintenances',[
      new TableColumn({
        name: 'use_distance',
        type: 'tinyint(4)',
        default: 0,
        isNullable: false,
      }),
      new TableColumn({
        name: 'use_strokes',
        type: 'tinyint(4)',
        default: 0,
        isNullable: false,
      }),
    ])
  }
}
