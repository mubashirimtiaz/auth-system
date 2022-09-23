import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { StrategyType } from 'src/auth/enum/auth.enum';
import { JwtTOKEN } from 'src/auth/interface/auth.interface';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE, messageMap } from 'src/common/messages';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerifyOauthTokenInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    try {
      const request = context.switchToHttp().getRequest();

      const code: string = request?.query?.code;

      if (!code) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.auth.error.AUTH_TOKEN_MISSING,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const payload = this.jwtService.decode(code) as JwtTOKEN;

      const user = await this.authService.validateUser(
        payload,
        StrategyType.JWT,
      );

      await this.jwtService.verify(code, {
        ignoreExpiration: false,
        secret:
          process.env.VERIFY_OAUTH_SECRET + user?.code?.registration?.value ||
          '',
      });

      await this.prismaService.code.update({
        where: {
          userId: user.id,
        },
        data: {
          registration: {
            unset: true,
          },
        },
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
