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

export class MCBasketPromoCodeParamsDto extends BasketDto {
  @IsInt()
  readonly userId: number;

  @IsBoolean()
  moderate: boolean;

  @IsString()
  promoCode: string;
}
