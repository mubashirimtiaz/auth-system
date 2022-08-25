import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsAlpha,
} from 'class-validator';

export class SignUpDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsAlpha()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(18)
  password: string;
}

export class SignInDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
