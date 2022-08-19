import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/classes/global.class';
import { AUTH_MESSAGE } from '../message/auth.message';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log(err, user, info, info?.message, err?.message);

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
