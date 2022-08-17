import { Request } from 'express';
import { UserPayload } from 'src/auth/interface/auth.interface';

export interface StrategyRequestHandler extends Request {
  user: UserPayload;
}
