import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const Payload = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});

const User = {
  params: {
    Payload,
  },
};

export default User;
