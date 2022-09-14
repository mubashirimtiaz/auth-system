import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  // IsInt,
  IsNumber,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ORGANIZATION_MESSAGE } from '../message/organization.message';

export class CreateOrganizationDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z ]+$/, {
    message: ORGANIZATION_MESSAGE.error.ORGANIZATION_INVALID_NAME,
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  website: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  teamSize: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  industryType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personaType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approachFrom: string;
}

export class UpdateOrganizationDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z ]+$/, {
    message: ORGANIZATION_MESSAGE.error.ORGANIZATION_INVALID_NAME,
  })
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  website: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  teamSize: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  industryType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  personaType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  approachFrom: string;
}
