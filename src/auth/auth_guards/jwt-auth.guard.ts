import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/classes/global.class';
import { AUTH_MESSAGE } from '../message/auth.message';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (info?.message === 'No auth token') {
      throw new ApiErrorResponse(
        {
          message: AUTH_MESSAGE.error.AUTH_TOKEN_MISSING,
          success: false,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (info?.message === 'jwt expired') {
      throw new ApiErrorResponse(
        {
          message: AUTH_MESSAGE.error.AUTH_TOKEN_EXPIRED,
          success: false,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (info?.message === 'invalid signature') {
      throw new ApiErrorResponse(
        {
          message: AUTH_MESSAGE.error.AUTH_TOKEN_INVALID,
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
