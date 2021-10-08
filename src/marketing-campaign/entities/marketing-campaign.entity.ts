import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { MarketingCampaignInfoEntity } from './marketing-campaign-info.entity';
import { MarketingCampaignGroupInfoEntity } from './marketing-campaign-group-info.entity';

export class MarketingCampaignEntity {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  pictureId: number;

  @Expose()
  detailPictureId: number;

  @Expose()
  text: string;

  @Expose()
  detailText: string;

  @Expose()
  sectionId: number;

  @Expose()
  sort: number;

  @Expose()
  xmlId: string;

  @Expose()
  price: number;

  @Expose()
  priceFormat: string;

  @Expose()
  priceBal: number;

  @Expose()
  priceBalFormat: string;

  @Expose()
  article: string;

  @Expose()
  skItemVal: string;

  @Expose()
  @Type(() => MarketingCampaignInfoEntity)
  stockInfo: MarketingCampaignInfoEntity;

  @Expose()
  @Type(() => MarketingCampaignGroupInfoEntity)
  groupInfo: MarketingCampaignGroupInfoEntity;
}
