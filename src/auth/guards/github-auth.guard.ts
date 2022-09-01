import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/common/classes';
import { MESSAGE } from 'src/common/messages';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(error, user, info) {
    console.log('from-github', error, user, info);

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
