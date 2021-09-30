import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class PriceModel {
  @Type(() => Number)
  id: number;

  @Type(() => Number)
  price: number;
}
