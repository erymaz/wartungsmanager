import { ApiProperty } from '@nestjs/swagger';

import { AssetClassDto } from '../../asset/dto/AssetDto';

export class AssetTreeNodeClassDto extends AssetClassDto {
  @ApiProperty({ type: () => Array })
  children!: AssetTreeNodeClassDto[];
}
