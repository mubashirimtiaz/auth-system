import { OAUTH_PROVIDER } from '@prisma/client';

export type UserValidationData = {
  email: string;
  password?: string | null;
  providerId?: string | null;
  lastName: string;
  firstName: string;
  picture?: string | null;
  providerName: OAUTH_PROVIDER;
};
