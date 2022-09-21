import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { SERVICE_MESSAGE } from '../message/service.message';

export class CreateServiceDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[a-zA-Z ]+$/, {
    message: SERVICE_MESSAGE.error.SERVICE_INVALID_NAME,
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
    {
      message: SERVICE_MESSAGE.error.SERVICE_INVALID_PROXY_SERVER_URL_NAME,
    },
  )
  proxyServerUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-/ ]+$/, {
    message: SERVICE_MESSAGE.error.SERVICE_INVALID_PROXY_PATH_NAME,
  })
  proxyPath: string;
}

export class UpdateServiceDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  @Matches(/^[a-zA-Z ]+$/, {
    message: SERVICE_MESSAGE.error.SERVICE_INVALID_NAME,
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Matches(
    /^https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
    {
      message: SERVICE_MESSAGE.error.SERVICE_INVALID_PROXY_SERVER_URL_NAME,
    },
  )
  proxyServerUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-/ ]+$/, {
    message: SERVICE_MESSAGE.error.SERVICE_INVALID_PROXY_PATH_NAME,
  })
  proxyPath: string;
}
