import { HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from 'src/classes/global.class';
import { ApiResponse } from 'src/interfaces/global.interface';
import { GLOBAL_MESSAGE } from 'src/messages/global.message';

export const ApiSuccessResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
): ApiResponse<T> => {
  return {
    message,
    success,
    ...(data && { data }),
  };
};

export const getRequiredProperties = (
  payload: { [key: string]: any },
  excludedProp: string[],
) => {
  excludedProp.forEach((prop) => delete payload[prop]);
  return payload;
};

export const throwApiErrorResponse = <T>(error: {
  response: ApiResponse<T>;
  status: HttpStatus;
}) => {
  throw new ApiErrorResponse(
    {
      message:
        error?.response?.message || GLOBAL_MESSAGE.error.INTERNAL_SERVER_ERROR,
      success: error?.response?.success || false,
      ...(error?.response?.data && { data: error?.response?.data }),
    },
    error?.status || HttpStatus.BAD_REQUEST,
  );
};
