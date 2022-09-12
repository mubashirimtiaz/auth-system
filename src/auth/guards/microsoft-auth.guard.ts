import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(error, user, info) {
    console.log('from-microsoft', error, user, info);

    // You can throw an exception based on either "info" or "err" arguments
    if (error) {
      throwApiErrorResponse(error);
    }
    if (!user) {
      throwApiErrorResponse({
        response: {
          message: MESSAGE.user.error.USER_NOT_FOUND,
          success: false,
        },
        status: HttpStatus.NOT_FOUND,
      });
    }

    return user;
  }
}
