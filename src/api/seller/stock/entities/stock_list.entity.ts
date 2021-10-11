import { ApiProperty } from '@nestjs/swagger';
import { StockListEntity } from 'src/stocks/entities/stock-list.entity';
import { GiftInfo } from './gift_info.entity';
import { MarketingCampaignGroupInfo } from './marketing_campaign_group_info.entity';
import { MarketingCampaignInfo } from './marketing_campaign_info.entity';
import { StockProduct } from './stock_product.entity';

export class StockList extends StockProduct implements StockListEntity {
  @ApiProperty()
  giftInfo: GiftInfo;

  @ApiProperty()
  stockInfo: MarketingCampaignInfo;

  @ApiProperty()
  groupInfo: MarketingCampaignGroupInfo;

  @ApiProperty()
  isGift: Boolean;
}
