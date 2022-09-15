import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const Payload = createParamDecorator(
  (param: string, context: ExecutionContext) => {
    const request: object = context.switchToHttp().getRequest();
    return request?.[param];
  },
);

const DECORATORS = {
  //User

  //general
  general: {
    params: {
      Payload,
    },
  },
};

export default DECORATORS;
