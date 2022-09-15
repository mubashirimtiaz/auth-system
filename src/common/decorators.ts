import User from 'src/user/decorator/user.decorator';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const Payload = createParamDecorator(
  (param: string, context: ExecutionContext) => {
    const request: object = context.switchToHttp().getRequest();
    return request?.[param];
  },
);

const DECORATORS = {
  //USER
  user: User,

  //general
  general: {
    params: {
      Payload,
    },
  },
};

export default DECORATORS;
