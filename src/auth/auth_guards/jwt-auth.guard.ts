import {
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/classes/global.class';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (info.message === 'jwt expired') {
      throw new ApiErrorResponse(
        {
          message: 'Token expired',
          success: false,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (info.message === 'invalid signature') {
      throw new ApiErrorResponse(
        {
          message: 'Invalid token',
          success: false,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
