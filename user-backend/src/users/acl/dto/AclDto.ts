import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostAclRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  roleId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  resourceId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rightKey!: string;
}

export class PutAclRequestDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  roleId!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  resourceId!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rightKey!: string;
}
