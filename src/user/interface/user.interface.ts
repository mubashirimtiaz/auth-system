import {
  OAuthProvider as OAuthProviderModel,
  User as UserModel,
} from '@prisma/client';

export interface User extends Partial<UserModel> {
  oAuthProviders?: Partial<OAuthProviderModel>[];
}