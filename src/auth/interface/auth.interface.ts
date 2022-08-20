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
  hash?: string | null;
}

export interface JwtTOKEN {
  iat: number;
  exp: number;
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface User extends Partial<UserModel> {
  oAuthProviders?: Partial<OAuthProviderModel>[];
}
