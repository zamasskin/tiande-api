import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GetMarketingCampaignDto {
  @ApiProperty()
  @IsInt()
  readonly guestId: number;

  @ApiProperty()
  @IsInt()
  readonly userId: number = 0;
}
