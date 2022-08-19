import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/classes/global.class';
import { AUTH_MESSAGE } from '../message/auth.message';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  handleRequest(err, user, info) {
    if (info?.message === 'Missing credentials') {
      throw new ApiErrorResponse(
        {
          message: AUTH_MESSAGE.error.USER_MISSING_CREDENTIALS,
          success: false,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err ||
        new ApiErrorResponse(
          { message: AUTH_MESSAGE.error.USER_NOT_FOUND, success: false },
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
