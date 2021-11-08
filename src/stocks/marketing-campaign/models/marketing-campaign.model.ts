import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class MarketingCampaignModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Expose({ name: 'UF_DESCRIPTION' })
  description: string;

  @Type(() => Number)
  @Expose({ name: 'PRODUCT_ID' })
  productId: number;

  @Expose({ name: 'UF_DISCKOUNT' })
  discount: number;

  @Expose({ name: 'UF_DISOUNT_TYPE' })
  _discountType: number;
  get discountPercent() {
    return this._discountType === 286;
  }

  @Expose({ name: 'UF_VIDEO' })
  video: string;

  @Type(() => Number)
  @Expose({ name: 'UF_STORIES_ID' })
  storiesId: number;

  calculate(price: number) {
    return this.discountPercent
      ? (price * this.discount) / 100
      : price - this.discount;
  }

  @Type(() => Number)
  @Expose({ name: 'UF_GROUP_ID' })
  groupId: number;
}
