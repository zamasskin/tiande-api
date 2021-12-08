import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class CashbackEntity {
  @Expose({ name: 'ID' })
  @Type(() => Number)
  id: number;

  @Expose({ name: 'UF_PERCENT' })
  @Type(() => Number)
  percent: number;

  @Expose({ name: 'UF_NAME' })
  name: string;

  @Expose({ name: 'UF_DATE_START' })
  @Type(() => Date)
  dateStart: Date;

  @Expose({ name: 'UF_DATE_END' })
  @Type(() => Date)
  dateEnd: Date;

  @Expose({ name: 'UF_NEWBIES_CUSTOMER' })
  @Type(() => Boolean)
  newbiesCustomer: Boolean;

  @Expose({ name: 'UF_ACTIVE' })
  @Type(() => Boolean)
  active: Boolean;

  @Expose({ name: 'UF_OWNER_BONUS' })
  @Type(() => Number)
  ownerBonus: number;

  @Expose({ name: 'UF_MIN_ORDER_PRICE' })
  @Type(() => Number)
  minOrderPrice: number;

  @Expose({ name: 'UF_FIX_CASHBACK' })
  @Type(() => Number)
  fixCashback: number;

  @Expose({ name: 'UF_STOCK_ID' })
  @Type(() => Number)
  stockId: number;
}
