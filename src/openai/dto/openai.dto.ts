import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { IMG_SIZE } from '../enum/openai.enum';

export class ImgGenDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Max(3)
  @IsNumber()
  n = 1;

  @ApiProperty()
  @IsString()
  @IsEnum(IMG_SIZE)
  @IsNotEmpty()
  size: string;
}
