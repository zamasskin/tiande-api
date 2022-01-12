import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean } from 'class-validator';

import {
  MCBasketItems,
  MCBasketParamsDto,
  MCBasketPromoCodeParamsDto,
} from 'src/stocks/marketing-campaign/basket/dto/mc-basket-params.dto';

export class MarketingCampaignBasketDto implements MCBasketParamsDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsInt()
  stockId: number;

  @ApiProperty()
  @IsInt()
  guestId: number;

  @ApiProperty()
  @IsInt()
  offerId: number;

  @ApiProperty({ default: 134, required: false })
  @IsInt()
  countryId: number;

  @ApiProperty({ default: 1, required: false })
  @IsInt()
  langId: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  sku: { [key: string]: string };

  @ApiProperty({ default: 1, required: false })
  @IsInt()
  quantity: number;

  @IsBoolean()
  @ApiProperty({ default: false, required: false })
  moderate: boolean;
}

export class MarketingCampaignBasketItems implements MCBasketItems {
  @ApiProperty()
  @IsInt()
  offerId: number;

  @ApiProperty()
  sku: { [key: string]: string };

  @ApiProperty()
  @IsInt()
  stockId: number;
}
export class MarketingCampaignBasketCodeParamsDto
  implements MCBasketPromoCodeParamsDto
{
  @ApiProperty()
  @IsInt()
  guestId: number;

  @ApiProperty()
  @IsInt()
  userId: number;

  @IsBoolean()
  @ApiProperty({ default: false, required: false })
  moderate: boolean;

  @ApiProperty()
  promoCode: string;

  @ApiProperty()
  basketItems: MarketingCampaignBasketItems[];

  @ApiProperty({ default: 134, required: false })
  @IsInt()
  countryId: number;

  @ApiProperty({ default: 1, required: false })
  @IsInt()
  langId: number;

  @ApiProperty()
  currency: string;
}
