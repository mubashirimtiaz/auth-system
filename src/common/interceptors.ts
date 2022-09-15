import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtTOKEN } from 'src/auth/interface/auth.interface';
import { getRequiredProperties, throwApiErrorResponse } from './functions';
import { MESSAGE } from './messages';

@Injectable()
export class TransformResInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<Response> {
    return next.handle().pipe(
      map((res) => {
        if (res?.data?.user) {
          getRequiredProperties(res.data?.user, ['hash', 'code']);
          return res;
        }
        if (res?.data) {
          getRequiredProperties(res.data, ['hash', 'code']);
          return res;
        }
        return res;
      }),
    );
  }
}

@Injectable()
export class DecodeJWTCodeInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    try {
      const request = context.switchToHttp().getRequest();

      const token: string = request?.query?.['token'];

      if (!token) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.general.error.MISSING_CODE,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const payload = this.jwtService.decode(token) as JwtTOKEN;

      request.meta = payload;

      return next.handle();
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
