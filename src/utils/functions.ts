import { ApiResponse } from 'src/interfaces/global.interface';

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
