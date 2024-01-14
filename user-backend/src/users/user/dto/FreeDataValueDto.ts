import { ApiProperty } from '@nestjs/swagger';

export class FreeDataValueDto {
  @ApiProperty()
  value!: unknown;
}
