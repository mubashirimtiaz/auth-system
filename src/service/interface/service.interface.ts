import {
  Organization as OrganizationModel,
  Service as ServiceModel,
} from '@prisma/client';
import { User } from 'src/common/interfaces';

export interface Service extends ServiceModel {
  user?: Partial<User>;
  organization?: Partial<OrganizationModel>;
}
