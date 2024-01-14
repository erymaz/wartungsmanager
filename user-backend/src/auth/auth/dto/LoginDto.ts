import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty()
  username!: string;

  @ApiProperty()
  @IsNotEmpty()
  password!: string;
}

export class TokenDto {
  @ApiProperty()
  token!: string | null;
}
