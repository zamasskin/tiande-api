import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class MarketingCampaignGroupModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Type(() => Boolean)
  @Expose({ name: 'UF_REPEAT_ORDER' })
  orderRepeat: boolean;

  @Expose({ name: 'UF_NAME' })
  name: string;

  @Expose({ name: 'UF_PROMO_CODE' })
  promoCode: string;

  @Expose({ name: 'UF_DATE_START' })
  startActiveDate: Date;

  @Expose({ name: 'UF_DATE_END' })
  endActiveDate: Date;

  @Expose({ name: 'UF_REGISTER_START' })
  dateRegisterStart: Date;

  @Expose({ name: 'UF_REGISTER_END' })
  dateRegisterEnd: Date;
}
