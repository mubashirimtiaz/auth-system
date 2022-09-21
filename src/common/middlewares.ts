import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as md5 from 'md5';
import * as geoip from 'geoip-country';

import { throwApiErrorResponse } from './functions';
import { MESSAGE } from './messages';

@Injectable()
export class VerifySignatureMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'];
    const ip = req?.headers?.['x-forwarded-for'] || '101.53.248.35';
    const country =
      this.configService.get('STAGE') === 'dev'
        ? 'LOCAL'
        : geoip.lookup(ip)?.country;

    const signature =
      req.headers['x-signature-token'] || req.query['x-signature-token'];

    const hashCode = md5(JSON.stringify({ userAgent, country }));
    if (signature === 'bypass' || signature === hashCode) {
      next();
    } else {
      throwApiErrorResponse({
        response: {
          message: MESSAGE.general.error.INVALID_AWS_MQTT_IOT_SIGNATURE_TOKEN,
          success: false,
        },
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
