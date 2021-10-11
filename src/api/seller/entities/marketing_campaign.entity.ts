import { ApiProperty } from '@nestjs/swagger';
import { MarketingCampaignEntity } from 'src/stocks/marketing-campaign/entities/marketing-campaign.entity';
import { MarketingCampaignGroupInfo } from './marketing_campaign_group_info.entity';
import { MarketingCampaignInfo } from './marketing_campaign_info.entity';
import { StockProduct } from './stock_product.entity';

export class MarketingCampaign
  extends StockProduct
  implements MarketingCampaignEntity
{
  @ApiProperty()
  stockInfo: MarketingCampaignInfo;

  @ApiProperty()
  groupInfo: MarketingCampaignGroupInfo;
}
