import { Request } from 'express';
import { User } from 'src/user/interface/user.interface';

//USER
export { JwtTOKEN } from 'src/auth/interface/auth.interface';
//USER

//AUTH
export { User } from 'src/user/interface/user.interface';
//AUTH

//GENERAL
export interface StrategyRequestHandler extends Request {
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
//GENERAL
