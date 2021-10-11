import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { MarketingCampaignInfoEntity } from './marketing-campaign-info.entity';
import { MarketingCampaignGroupInfoEntity } from './marketing-campaign-group-info.entity';
import { StockProductEntity } from 'src/stocks/entities/stock-product.entity';

export class MarketingCampaignEntity extends StockProductEntity {
  @Expose()
  @Type(() => MarketingCampaignInfoEntity)
  stockInfo: MarketingCampaignInfoEntity;

  @Expose()
  @Type(() => MarketingCampaignGroupInfoEntity)
  groupInfo: MarketingCampaignGroupInfoEntity;
}
