import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class MarketingCampaignInfoEntity {
  @Expose()
  id = 0;

  @Expose()
  video = '';

  @Expose()
  discount = 0;

  @Expose()
  storiesId = 0;

  @Expose()
  description = '';

  @Expose()
  productId = 0;

  @Expose()
  price = 0;

  @Expose()
  priceFormat = '';

  @Expose()
  discountPercent = false;
}
