import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { IMG_SIZE } from '../enum/openai.enum';

export class ImgGenDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty()
  @IsInt()
  @Max(3)
  @Min(1)
  n: number;

  @ApiProperty()
  @IsString()
  @IsEnum(IMG_SIZE)
  @IsNotEmpty()
  size: string;
}
