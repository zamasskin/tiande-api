import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

import { MCBasketParamsDto } from 'src/stocks/marketing-campaign/basket/dto/mc-basket-params.dto';

export class MarketingCampaignBasketDto implements MCBasketParamsDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsInt()
  stockGroupId: number;

  @ApiProperty()
  @IsInt()
  guestId: number;

  @ApiProperty()
  @IsInt()
  offerId: number;

  @ApiProperty({ default: 134, required: false })
  @IsInt()
  countryId: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  sku: { [key: string]: string };

  @ApiProperty({ default: 1, required: false })
  @IsInt()
  quantity: number;
}
