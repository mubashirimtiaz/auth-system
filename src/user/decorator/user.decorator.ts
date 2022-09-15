import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const Payload = createParamDecorator(
  (param: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request?.[param];
  },
);

const User = {
  params: {
    Payload,
  },
};

export default User;
