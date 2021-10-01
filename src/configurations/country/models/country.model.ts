import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class CountryModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Expose({ name: 'UF_CURRENCY' })
  currency: string;
}
