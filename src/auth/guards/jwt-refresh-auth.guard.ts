import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/common/classes';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';
import { AUTH_MESSAGE } from '../message/auth.message';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh-token') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(error, user, info) {
    if (info?.message === 'No auth token') {
      throwApiErrorResponse({
        response: {
          message: AUTH_MESSAGE.error.AUTH_TOKEN_MISSING,
          success: false,
        },
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    if (info?.message === 'jwt expired') {
      throwApiErrorResponse({
        response: {
          message: AUTH_MESSAGE.error.AUTH_TOKEN_EXPIRED,
          success: false,
        },
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    if (info?.message === 'invalid signature') {
      throwApiErrorResponse({
        response: {
          message: AUTH_MESSAGE.error.AUTH_TOKEN_INVALID,
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
          { message: MESSAGE.user.error.USER_NOT_FOUND, success: false },
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
