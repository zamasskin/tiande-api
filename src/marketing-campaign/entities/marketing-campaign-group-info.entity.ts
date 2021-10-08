import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { MarketingCampaignGroupModel } from '../models/marketing-campaign-group.model';

export class MarketingCampaignGroupInfoEntity
  implements MarketingCampaignGroupModel
{
  @Expose()
  id: number;

  @Expose()
  orderRepeat: boolean;

  @Expose()
  name: string;

  @Expose()
  promoCode: string;

  @Expose()
  startActiveDate: Date;

  @Expose()
  endActiveDate: Date;

  @Expose()
  dateRegisterStart: Date;

  @Expose()
  dateRegisterEnd: Date;
}
