import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { MarketingCampaignParamsDto } from 'src/marketing-campaign/dto/marketing-campaign-params.dto';

export class GetMarketingCampaignDto implements MarketingCampaignParamsDto {
  @ApiProperty()
  @IsInt()
  readonly guestId: number;

  @ApiProperty()
  @IsInt()
  readonly userId: number = 0;

  @ApiProperty()
  @IsInt()
  readonly countryId: number = 134;

  @ApiProperty()
  @IsInt()
  readonly langId: number = 1;
}
