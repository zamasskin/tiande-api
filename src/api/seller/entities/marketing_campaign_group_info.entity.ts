import { ApiProperty } from '@nestjs/swagger';
import { MarketingCampaignGroupInfoEntity } from 'src/marketing-campaign/entities/marketing-campaign-group-info.entity';

export class MarketingCampaignGroupInfo
  implements MarketingCampaignGroupInfoEntity
{
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderRepeat: boolean;

  @ApiProperty()
  name: string;

  @ApiProperty()
  promoCode: string;

  @ApiProperty()
  startActiveDate: Date;

  @ApiProperty()
  endActiveDate: Date;

  @ApiProperty()
  dateRegisterStart: Date;

  @ApiProperty()
  dateRegisterEnd: Date;
}
