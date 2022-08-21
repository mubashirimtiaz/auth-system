import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getRequiredProperties } from './functions';

@Injectable()
export class TransformResInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<Response> {
    return next.handle().pipe(
      map((res) => {
        if (res?.data) {
          const data = getRequiredProperties(res.data, ['hash']);
          return { ...res, data };
        }
        return res;
      }),
    );
  }
}
