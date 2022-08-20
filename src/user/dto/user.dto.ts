import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class UpdatePasswordDTO {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class UpdateForgetPasswordDTO {
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ForgetPasswordDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
