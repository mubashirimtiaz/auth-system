import { HttpException } from '@nestjs/common';
import { ApiResponse } from 'src/common/interfaces';

export class ApiErrorResponse<T> extends HttpException {
  constructor(message: ApiResponse<T>, statusCode: number) {
    super(message, statusCode);
  }
}
