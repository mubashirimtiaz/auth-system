import { OAUTH_PROVIDER } from '@prisma/client';

export type UserValidationData = {
  email: string;
  password?: string | null;
  providerId?: string | null;
  name: string;
  picture?: string | null;
  providerName: OAUTH_PROVIDER;
};

export type Token = {
  refreshToken?: string;
  accessToken: string;
};
