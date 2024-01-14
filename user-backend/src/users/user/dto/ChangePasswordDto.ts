import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  password!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  newPassword!: string;

  @IsString()
  @MinLength(2)
  @ApiProperty()
  passwordResetToken!: string;
}
