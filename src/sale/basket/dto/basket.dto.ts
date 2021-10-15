import { IsInt } from 'class-validator';

export class BasketDto {
  @IsInt()
  readonly guestId: number;

  @IsInt()
  readonly offerId: number;

  @IsInt()
  readonly countryId: number = 134;

  readonly currency: string;

  readonly sku: { [key: string]: string };

  @IsInt()
  readonly quantity: number;
}
