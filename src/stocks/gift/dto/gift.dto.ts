import { IsInt } from 'class-validator';

export class GiftDto {
  @IsInt()
  readonly guestId: number;

  @IsInt()
  readonly userId: number = 0;

  @IsInt()
  readonly countryId: number = 134;

  @IsInt()
  readonly langId: number = 1;
}
