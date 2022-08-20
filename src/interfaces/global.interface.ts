import { Request } from 'express';
import { User } from 'src/auth/interface/auth.interface';

export interface StrategyRequestHandler extends Request {
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
