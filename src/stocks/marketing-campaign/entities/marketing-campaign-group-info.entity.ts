import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { MarketingCampaignGroupModel } from '../models/marketing-campaign-group.model';

export class MarketingCampaignGroupInfoEntity
  implements MarketingCampaignGroupModel
{
  @Expose()
  id = 0;

  @Expose()
  orderRepeat = false;

  @Expose()
  name = '';

  @Expose()
  promoCode = '';

  @Expose()
  startActiveDate: Date;

  @Expose()
  endActiveDate: Date;

  @Expose()
  dateRegisterStart: Date;

  @Expose()
  dateRegisterEnd: Date;
}
