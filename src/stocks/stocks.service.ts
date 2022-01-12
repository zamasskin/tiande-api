import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import * as _ from 'lodash';
import { StockListEntity } from './entities/stock-list.entity';
import { GiftDto } from './gift/dto/gift.dto';
import { GiftService } from './gift/gift.service';
import { MCBasketService } from './marketing-campaign/basket/basket.service';
import {
  MCBasketParamsDto,
  MCBasketPromoCodeParamsDto,
} from './marketing-campaign/basket/dto/mc-basket-params.dto';
import { MarketingCampaignParamsDto } from './marketing-campaign/dto/marketing-campaign-params.dto';
import { MarketingCampaignService } from './marketing-campaign/marketing-campaign.service';

@Injectable()
export class StocksService {
  constructor(
    private marketingCampaignService: MarketingCampaignService,
    private giftService: GiftService,
    private mcBasketService: MCBasketService,
  ) {}

  async findMarketingCampaignList(dto: MarketingCampaignParamsDto) {
    const items = await this.marketingCampaignService.findList(dto);
    items.sort(this.sortByDate('groupInfo.endActiveDate'));
    return items;
  }

  async findMarketingCampaignListByPromoCode(
    dto: MarketingCampaignParamsDto,
    promoCode: string,
  ) {
    return this.marketingCampaignService.findByPromoCode(dto, promoCode);
  }

  marketingCampaignAddBasket(dto: MCBasketParamsDto) {
    return this.mcBasketService.add(dto);
  }

  marketingCampaignAddBasketByPromoCode(dto: MCBasketPromoCodeParamsDto) {
    return this.mcBasketService.addByPromoCode(dto);
  }

  findGiftList(dto: GiftDto) {
    return this.giftService.findList(dto);
  }

  sortByDate<T>(template: string) {
    return (a: T, b: T) => {
      const aDate = _.get(a, template, null);
      const bDate = _.get(b, template, null);
      if (aDate === bDate) {
        return 0;
      }
      if (!aDate) {
        return 1;
      }
      if (!bDate) {
        return -1;
      }
      return aDate > bDate ? 1 : -1;
    };
  }

  async findList(dto: MarketingCampaignParamsDto | GiftDto) {
    const [marketingCampaigns, gifts] = await Promise.all([
      this.marketingCampaignService.findList(dto),
      this.giftService.findList(dto),
    ]);

    const result = [
      ...marketingCampaigns.map((mc) => ({
        ...mc,
        isGift: false,
        dateEnd: mc.groupInfo.endActiveDate,
      })),
      ...gifts.map((g) => ({
        ...g,
        isGift: true,
        dateEnd: g.giftInfo.dateEnd,
      })),
    ];
    result.sort(this.sortByDate('dateEnd'));

    return plainToClass(StockListEntity, result, { exposeUnsetFields: false });
  }

  marketingCampaignBasketCheckAndUpdate(dto: MarketingCampaignParamsDto) {
    return this.mcBasketService.checkAndUpdate(dto);
  }
}
