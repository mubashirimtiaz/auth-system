import {
  Organization as OrganizationModel,
  OrganizationMate as OrganizationMateModel,
} from '@prisma/client';
import { User } from 'src/common/interfaces';

export interface Organization extends OrganizationModel {
  owner?: Partial<User>;
  members?: Partial<OrganizationMateModel>[];
}
