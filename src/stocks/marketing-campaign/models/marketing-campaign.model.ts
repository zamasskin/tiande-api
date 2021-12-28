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
    const discountPercent = this.discount > 100 ? 100 : this.discount;
    return this.discountPercent
      ? (1 - discountPercent / 100) * price
      : price - this.discount;
  }

  @Type(() => Number)
  @Expose({ name: 'UF_GROUP_ID' })
  groupId: number;
}
