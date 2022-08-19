import {
  OAuthProvider as OAuthProviderModel,
  User as UserModel,
} from '@prisma/client';

export interface UserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
  picture?: string | null;
}

export interface JwtTOKEN extends UserPayload {
  iat: number;
  exp: number;
  id: undefined | null;
  sub: string;
}

export interface User extends Partial<UserModel> {
  oAuthProviders?: Partial<OAuthProviderModel>[];
}
