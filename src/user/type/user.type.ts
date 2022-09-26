import { User } from '../interface/user.interface';

export enum PASSWORD_CHANGE_TYPE {
  UPDATE = 'UPDATE',
  FORGET = 'FORGET',
}

export type AuthToken = {
  refreshToken?: string;
  accessToken: string;
  user: User;
};
