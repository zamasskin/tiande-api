import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { StockProductEntity } from 'src/stocks/entities/stock-product.entity';
import { GiftInfoEntity } from './gift-info.entity';

export class GiftEntity extends StockProductEntity {
  @Expose()
  @Type(() => GiftInfoEntity)
  giftInfo: GiftInfoEntity = new GiftInfoEntity();
}
