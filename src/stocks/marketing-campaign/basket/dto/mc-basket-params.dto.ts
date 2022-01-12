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

export class MCBasketPromoCodeParamsDto {
  @IsInt()
  readonly guestId: number;

  @IsInt()
  readonly userId: number;

  @IsBoolean()
  moderate: boolean;

  @IsString()
  promoCode: string;

  @IsInt()
  readonly quantity: number;

  @IsInt()
  readonly countryId: number = 134;

  @IsInt()
  readonly langId: number;

  currency: string;
}
