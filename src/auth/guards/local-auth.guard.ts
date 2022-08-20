import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/common/classes';
import { throwApiErrorResponse } from 'src/common/functions';
import { AUTH_MESSAGE } from '../message/auth.message';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  handleRequest(error, user, info) {
    if (info?.message === 'Missing credentials') {
      throwApiErrorResponse({
        response: {
          message: AUTH_MESSAGE.error.USER_MISSING_CREDENTIALS,
          success: false,
        },
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // You can throw an exception based on either "info" or "err" arguments
    if (error || !user) {
      throw (
        error ||
        new ApiErrorResponse(
          { message: AUTH_MESSAGE.error.USER_NOT_FOUND, success: false },
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
