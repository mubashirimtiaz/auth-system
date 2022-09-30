import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';
import { appAccessDenied } from 'src/common/vars';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
  constructor(
    private context: ExecutionContext,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext) {
    this.context = context;
    return super.canActivate(context);
  }

  handleRequest(error, user, info) {
    console.log('from-microsoft', error, user, info);

    // You can throw an exception based on either "info" or "err" arguments
    if (info?.message === appAccessDenied) {
      const url = this.configService.get('WEB_URL');
      this.context
        .switchToHttp()
        .getResponse()
        .redirect(`${url}/access-denied`);
    }
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
