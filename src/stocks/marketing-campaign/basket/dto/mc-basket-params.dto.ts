import { IsInt, IsBoolean, IsString } from 'class-validator';
import { BasketDto } from 'src/sale/basket/dto/basket.dto';

export class MCBasketParamsDto extends BasketDto {
  @IsInt()
  readonly userId: number;

  @IsInt()
  readonly stockId: number;

  @IsBoolean()
  moderate: boolean;
}

export class MCBasketItems {
  @IsInt()
  readonly offerId: number;

  readonly sku: { [key: string]: string };

  @IsInt()
  readonly stockId: number;
}
export class MCBasketPromoCodeParamsDto {
  @IsInt()
  readonly guestId: number;

  @IsInt()
  readonly userId: number;

  @IsBoolean()
  moderate: boolean;

  @IsString()
  promoCode: string;

  basketItems: MCBasketItems[];

  @IsInt()
  readonly countryId: number = 134;

  @IsInt()
  readonly langId: number;

  currency: string;
}
