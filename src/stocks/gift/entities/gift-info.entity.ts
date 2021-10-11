import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class GiftInfoEntity {
  @Expose()
  id: number;

  @Expose()
  used: boolean;
}
