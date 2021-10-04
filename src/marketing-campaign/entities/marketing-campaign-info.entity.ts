import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class MarketingCampaignInfoEntity {
  @Expose()
  id: number;

  @Expose()
  video: string;

  @Expose()
  discount: number;

  @Expose()
  storiesId: number;

  @Expose()
  description: string;

  @Expose()
  productId: number;

  @Expose()
  price: number;

  @Expose()
  priceFormat: string;
}
