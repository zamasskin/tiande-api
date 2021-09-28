import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketingCampaignParamsDto } from './dto/marketing-campaign-params.dto';
import { Knex } from 'knex';

@Injectable()
export class MarketingCampaignService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }
  async findList(parameters: MarketingCampaignParamsDto) {
    const query = this.qb({ g: 'b_marketing_campaign_group' })
      .where('g.UF_DATE_START', '<=', new Date())
      .where('g.UF_DATE_END', '>=', new Date());
    const result = await query;

    return {
      id: 10,
    };
  }
}
