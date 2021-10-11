import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class PromotionGiftModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Type(() => Number)
  @Expose({ name: 'UF_PRODUCT' })
  productId: number;
}
