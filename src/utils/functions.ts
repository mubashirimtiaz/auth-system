export const apiResponseHandler = <T>(
  success: boolean,
  message: string,
  data?: T,
) => {
  return {
    message,
    success,
    ...(data && { data }),
  };
};
