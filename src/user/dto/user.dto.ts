import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MESSAGE } from 'src/common/messages';

export class UpdateProfileDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z ]+$/, {
    message: MESSAGE.user.error.USER_INVALID_NAME,
  })
  name: string;
}

export class UpdatePasswordDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,16})/, {
    message: MESSAGE.user.error.USER_INVALID_PASSWORD_SCHEMA,
  })
  newPassword: string;
}

export class UpdateForgetPasswordDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,16})/, {
    message: MESSAGE.user.error.USER_INVALID_PASSWORD_SCHEMA,
  })
  newPassword: string;
}

export class ForgetPasswordDTO {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UserEmailDTO {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
