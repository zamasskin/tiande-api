import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { MarketingCampaignParamsDto } from 'src/stocks/marketing-campaign/dto/marketing-campaign-params.dto';

export class GetMarketingCampaignDto implements MarketingCampaignParamsDto {
  @ApiProperty()
  @IsInt()
  readonly guestId: number;

  @IsInt()
  @ApiProperty({ required: false, default: 0 })
  readonly userId: number = 0;

  @ApiProperty({ required: false, default: 134 })
  @IsInt()
  readonly countryId: number = 134;

  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  readonly langId: number = 1;

  @ApiProperty({ required: false, default: false })
  readonly moderate?: boolean = false;
}

export class GetMarketingCampaignDtoByPromoCode extends GetMarketingCampaignDto {
  @ApiProperty()
  promoCode: string;
}
