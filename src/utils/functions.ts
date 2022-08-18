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
