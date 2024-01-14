import { Index, ViewColumn, ViewEntity } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

import { TABLE_PREFIX } from '../definitions';

@ViewEntity({
  name: TABLE_PREFIX + 'documents_view',
  expression: `
  SELECT
    ${TABLE_PREFIX}documents.id as id,
    ${TABLE_PREFIX}documents.tenant_id as tenant_id,
    ${TABLE_PREFIX}documents.title as title,
    ${TABLE_PREFIX}documents.ext as ext,
    ${TABLE_PREFIX}documents.created_at as created_at,
    ${TABLE_PREFIX}documents.archive as archive,
    CONCAT (
      '[',
        GROUP_CONCAT (
          '{',
            '"id":"', mt.id, '",',
            '"name":"', IFNULL(mt.name, ''), '",',
            '"machineId":"', IFNULL(mt.machine_id, ''), '"',
          '}'
          SEPARATOR ','
        ),
      ']'
    ) AS tasks,
    CONCAT (
      '[',
        GROUP_CONCAT (
          '{',
            '"id":"', m.id, '",',
            '"machineId":"', IFNULL(m.machine_id, ''), '",',
            '"title":"', IFNULL(m.title, ''), '"',
          '}'
          SEPARATOR ','
        ),
      ']'
    ) AS maintenances,
    CONCAT (
      '{',
        '"id":"', file.id, '",',
        '"name":"', IFNULL(file.name, ''), '"',
      '}'
    ) AS file
  FROM ${TABLE_PREFIX}documents
  LEFT JOIN ${TABLE_PREFIX}documents_tasks dtt ON dt.document_id = ${TABLE_PREFIX}documents.id
  LEFT JOIN ${TABLE_PREFIX}documents_maintenances dm ON dm.document_id = ${TABLE_PREFIX}documents.id
  LEFT JOIN ${TABLE_PREFIX}maintenances_tasks mt ON mt.id = dt.task_id
  LEFT JOIN maintenance m ON m.id = dm.maintenance_id
  INNER JOIN file ON file.id = ${TABLE_PREFIX}documents.file_id
  GROUP BY ${TABLE_PREFIX}documents.id
  `,
})
export class DocumentView {
  @ApiResponseProperty()
  @ViewColumn()
  id!: string;

  @ApiResponseProperty()
  @ViewColumn()
  tenantId!: string;

  @ApiResponseProperty()
  @ViewColumn()
  createdAt!: Date;

  @ApiProperty()
  @Index({ fulltext: true })
  @ViewColumn()
  title!: string;

  @ApiProperty()
  @ViewColumn()
  ext!: string;

  @ApiProperty()
  @ViewColumn()
  tasks!: string;

  @ApiProperty()
  @ViewColumn()
  maintenances!: string;

  @ApiProperty()
  @ViewColumn()
  file!: string;

  @ApiProperty()
  @ViewColumn()
  archive!: boolean;
}
