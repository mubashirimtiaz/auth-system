import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { StrategyType } from 'src/auth/enum/auth.enum';
import { JwtTOKEN } from 'src/auth/interface/auth.interface';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE, messageMap } from 'src/common/messages';

@Injectable()
export class VerifyEmailInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    try {
      const request = context.switchToHttp().getRequest();

      const token: string = request?.query?.token;
      const code: string = request?.query?.code;

      if (!token) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.auth.error.AUTH_TOKEN_MISSING,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const payload = this.jwtService.decode(token) as JwtTOKEN;

      const user = await this.authService.validateUser(
        payload,
        StrategyType.JWT,
      );

      if (user?.code?.emailVerification !== code) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.general.error.CODE_INVALID,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      await this.jwtService.verify(token, {
        ignoreExpiration: false,
        secret: process.env.VERIFY_EMAIL_SECRET + user.email,
      });

      request.user = user;

      return next.handle();
    } catch (error) {
      if (messageMap[error?.message]) {
        throwApiErrorResponse({
          response: {
            message: messageMap[error.message],
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }

      throwApiErrorResponse({
        response: {
          message: error?.message,
          success: false,
        },
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
