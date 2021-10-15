import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class CountryModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Expose({ name: 'UF_CURRENCY' })
  currency = 'RUB';

  @Type(() => Number)
  @Expose({ name: 'UF_DISCOUNT_AFTER_FO' })
  discountAfterFo: number;
}
