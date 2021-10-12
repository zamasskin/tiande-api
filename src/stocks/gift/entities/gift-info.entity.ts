import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class GiftInfoEntity {
  @Expose()
  id = 0;

  @Expose()
  used = false;

  @Expose()
  dateEnd: Date;
}
