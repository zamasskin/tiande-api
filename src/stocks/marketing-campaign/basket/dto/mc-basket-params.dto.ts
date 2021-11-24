import { IsInt, IsBoolean } from 'class-validator';
import { BasketDto } from 'src/sale/basket/dto/basket.dto';

export class MCBasketParamsDto extends BasketDto {
  @IsInt()
  readonly userId: number;

  @IsInt()
  readonly stockId: number;

  @IsBoolean()
  moderate: boolean;
}
