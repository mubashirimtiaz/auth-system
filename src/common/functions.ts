import { HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from 'src/common/classes';
import { ApiResponse } from 'src/common/interfaces';
import { MESSAGE } from 'src/common/messages';

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
  response?: ApiResponse<T>;
  message?: string;
  status: HttpStatus;
}) => {
  throw new ApiErrorResponse(
    {
      message:
        error?.response?.message ||
        error?.message ||
        MESSAGE.server.error.INTERNAL_SERVER_ERROR,
      success: error?.response?.success || false,
      ...(error?.response?.data && { data: error?.response?.data }),
    },
    error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

export const validationPipeException = (errors) => {
  const constraint = errors.reduce(
    (acc, curr) => ({
      ...acc,
      [curr?.property]: Object.values(curr?.constraints),
    }),
    {},
  );

  throwApiErrorResponse({
    response: {
      message: MESSAGE.general.error.VALIDATION_FAILED,
      success: false,
      data: constraint,
    },
    status: HttpStatus.NOT_ACCEPTABLE,
  });
};

export const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const addHrsAheadOfTime = (numOfHours: number): number => {
  const dateCopy = new Date();
  dateCopy.setTime(dateCopy.getTime() + numOfHours * 60 * 60 * 1000);
  return dateCopy.getTime();
};
