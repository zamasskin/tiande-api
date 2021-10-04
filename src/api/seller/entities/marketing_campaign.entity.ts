import { ApiProperty } from '@nestjs/swagger';
import { MarketingCampaignEntity } from 'src/marketing-campaign/entities/marketing-campaign.entity';
import { MarketingCampaignInfo } from './marketing_campaign_info.entity';

export class MarketingCampaign implements MarketingCampaignEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  pictureId: number;

  @ApiProperty()
  detailPictureId: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  detailText: string;

  @ApiProperty()
  sectionId: number;

  @ApiProperty()
  sort: number;

  @ApiProperty()
  xmlId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  priceFormat: string;

  @ApiProperty()
  priceBal: number;

  @ApiProperty()
  priceBalFormat: string;

  @ApiProperty()
  article: string;

  @ApiProperty()
  skItemVal: string;

  @ApiProperty()
  stockInfo: MarketingCampaignInfo;
}
