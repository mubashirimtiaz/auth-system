import { Injectable } from '@nestjs/common';
import { ApiSuccessResponse } from './common/functions';
import { ApiResponse } from './common/interfaces';
import { MESSAGE } from './common/messages';

@Injectable()
export class AppService {
  healthCheck(): ApiResponse<null> {
    return ApiSuccessResponse(true, MESSAGE.general.success.HEALTH_CHECK);
  }
}
