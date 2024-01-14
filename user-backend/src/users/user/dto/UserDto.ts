import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class PostUsersRequestDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  password!: string;
}

export class PutUsersRequestDto {
  @ApiProperty()
  @IsOptional()
  name!: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email!: string;
}
