import { IsInt } from 'class-validator';

export class PromoCodeDto {
  @IsInt()
  readonly guestId: number;

  @IsInt()
  readonly userId: number = 0;

  @IsInt()
  readonly countryId: number = 134;
}
