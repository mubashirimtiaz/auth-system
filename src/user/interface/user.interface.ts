import {
  Code,
  User as UserModel,
  OAuthProvider as OAuthProviderModel,
} from '@prisma/client';

export interface User extends UserModel {
  oAuthProviders?: Partial<OAuthProviderModel>[];
  code?: Partial<Code>;
}
