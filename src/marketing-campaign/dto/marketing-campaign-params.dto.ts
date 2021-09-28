import { IsInt } from 'class-validator';

export class MarketingCampaignParamsDto {
  @IsInt()
  readonly guestId: number;

  @IsInt()
  readonly userId: number = 0;
}
