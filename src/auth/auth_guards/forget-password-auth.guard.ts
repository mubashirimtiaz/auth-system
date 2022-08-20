import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorResponse } from 'src/classes/global.class';
import { throwApiErrorResponse } from 'src/utils/functions';
import { AUTH_MESSAGE } from '../message/auth.message';

@Injectable()
export class JwtForgetPasswordGuard extends AuthGuard(
  'jwt-forget-password-token',
) {}
