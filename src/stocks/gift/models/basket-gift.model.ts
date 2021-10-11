import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class BasketGiftModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Type(() => Number)
  @Expose({ name: 'ELEMENT_ID' })
  productId: number;

  @Type(() => Number)
  @Expose({ name: 'QUANTITY' })
  quantity: number;

  @Type(() => Number)
  @Expose({ name: 'PROMOTION_GIFT_ID' })
  giftId: number;
}
