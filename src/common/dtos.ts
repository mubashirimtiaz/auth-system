import { IsMongoId } from 'class-validator';
import { MESSAGE } from './messages';

export class MongoIdDTO {
  @IsMongoId({ message: MESSAGE.user.error.USER_INVALID_ID })
  id: string;
}
