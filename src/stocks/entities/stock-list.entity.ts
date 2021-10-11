import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { StockProductEntity } from './stock-product.entity';
import { GiftInfoEntity } from '../gift/entities/gift-info.entity';
import { MarketingCampaignInfoEntity } from '../marketing-campaign/entities/marketing-campaign-info.entity';
import { MarketingCampaignGroupInfoEntity } from '../marketing-campaign/entities/marketing-campaign-group-info.entity';

export class StockListEntity extends StockProductEntity {
  @Expose()
  @Type(() => GiftInfoEntity)
  giftInfo: GiftInfoEntity = new GiftInfoEntity();

  @Expose()
  @Type(() => MarketingCampaignInfoEntity)
  stockInfo: MarketingCampaignInfoEntity = new MarketingCampaignInfoEntity();

  @Expose()
  @Type(() => MarketingCampaignGroupInfoEntity)
  groupInfo: MarketingCampaignGroupInfoEntity = new MarketingCampaignGroupInfoEntity();

  @Expose()
  isGift: Boolean;
}
