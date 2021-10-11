import { ApiProperty } from '@nestjs/swagger';
import { MarketingCampaignInfoEntity } from 'src/marketing-campaign/entities/marketing-campaign-info.entity';

export class MarketingCampaignInfo implements MarketingCampaignInfoEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  video: string;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  storiesId: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  priceFormat: string;

  @ApiProperty()
  discountPercent: boolean;
}
