import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description!: string;
}

export class PutRoleRequestDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description!: string;
}
