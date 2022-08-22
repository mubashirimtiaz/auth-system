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
import { MESSAGE } from 'src/common/messages';

@Injectable()
export class ForgetPasswordInterceptor implements NestInterceptor {
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
      const token = request?.query?.token;
      if (!token) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.auth.error.AUTH_TOKEN_MISSING,
            success: false,
          },
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const payload = this.jwtService.decode(token) as JwtTOKEN;

      const user = await this.authService.validateUser(
        payload,
        StrategyType.JWT,
      );

      await this.jwtService.verify(token, {
        ignoreExpiration: false,
        secret: process.env.JWT_FORGET_PASSWORD_SECRET + user.hash,
      });

      request.user = user;

      return next.handle();
    } catch (error) {
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
