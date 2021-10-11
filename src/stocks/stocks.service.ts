import { Injectable } from '@nestjs/common';
import { GiftDto } from './gift/dto/gift.dto';
import { GiftService } from './gift/gift.service';
import { MarketingCampaignParamsDto } from './marketing-campaign/dto/marketing-campaign-params.dto';
import { MarketingCampaignService } from './marketing-campaign/marketing-campaign.service';

@Injectable()
export class StocksService {
  constructor(
    private marketingCampaignService: MarketingCampaignService,
    private giftService: GiftService,
  ) {}

  findMarketingCampaignList(dto: MarketingCampaignParamsDto) {
    return this.marketingCampaignService.findList(dto);
  }

  findGiftList(dto: GiftDto) {
    return this.giftService.findList(dto);
  }
}
