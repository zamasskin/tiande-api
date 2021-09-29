import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class MarketingCampaignGroupModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Type(() => Boolean)
  @Expose({ name: 'UF_REPEAT_ORDER' })
  orderRepeat: boolean;
}
