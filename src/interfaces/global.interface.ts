import { Request } from 'express';
import { UserPayload } from 'src/auth/interface/auth.interface';

export interface StrategyRequestHandler extends Request {
  user: UserPayload;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
