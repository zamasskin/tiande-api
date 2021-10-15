import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class PriceEntity {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Type(() => Number)
  @Expose({ name: 'PRODUCT_ID' })
  productId: number;

  @Type(() => Number)
  @Expose({ name: 'CATALOG_GROUP_ID' })
  priceId: number;

  @Expose({ name: 'PRICE' })
  price: number;

  @Expose({ name: 'CURRENCY' })
  currency: string;
}
