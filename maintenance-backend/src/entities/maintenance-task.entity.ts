import { ViewColumn, ViewEntity } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

import { TABLE_PREFIX } from '../definitions';

@ViewEntity({
  name: TABLE_PREFIX + 'maintenances_tasks',
  expression: `
    SELECT
      ${TABLE_PREFIX}tasks.id as id,
      ${TABLE_PREFIX}tasks.tenant_id as id,
      ${TABLE_PREFIX}tasks.name as name,
      ${TABLE_PREFIX}tasks.responsible as responsible,
      ${TABLE_PREFIX}maintenances.due_date as due_date,
      ${TABLE_PREFIX}maintenances.machine_id as machine_id,
      ${TABLE_PREFIX}maintenances.title as maintenance,
      ${TABLE_PREFIX}maintenances.status as status,
      ${TABLE_PREFIX}maintenances.id as maintenance_id
    FROM ${TABLE_PREFIX}tasks
    LEFT JOIN ${TABLE_PREFIX}maintenances ON ${TABLE_PREFIX}maintenances.id = ${TABLE_PREFIX}tasks.maintenance_id
  `,
})
export class MaintenanceTask {
  @ApiResponseProperty()
  @ViewColumn()
  id!: string;

  @ApiResponseProperty()
  @ViewColumn()
  tenantId!: string;

  @ApiProperty()
  @ViewColumn()
  name!: string;

  @ApiProperty()
  @ViewColumn()
  responsible!: string;

  @ApiProperty()
  @ViewColumn()
  dueDate!: Date;

  @ApiProperty()
  @ViewColumn()
  machineId!: string;

  @ApiProperty()
  @ViewColumn()
  maintenance!: string;

  @ApiProperty()
  @ViewColumn()
  status!: string;

  @ApiProperty()
  @ViewColumn()
  maintenanceId!: string;
}
