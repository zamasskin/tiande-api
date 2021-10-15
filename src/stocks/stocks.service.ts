import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { StockListEntity } from './entities/stock-list.entity';
import { GiftDto } from './gift/dto/gift.dto';
import { GiftService } from './gift/gift.service';
import { BasketService as MCBasketService } from './marketing-campaign/basket/basket.service';
import { MCBasketParamsDto } from './marketing-campaign/basket/dto/mc-basket-params.dto';
import { MarketingCampaignParamsDto } from './marketing-campaign/dto/marketing-campaign-params.dto';
import { MarketingCampaignService } from './marketing-campaign/marketing-campaign.service';

@Injectable()
export class StocksService {
  constructor(
    private marketingCampaignService: MarketingCampaignService,
    private giftService: GiftService,
    private mcBasketService: MCBasketService,
  ) {}

  findMarketingCampaignList(dto: MarketingCampaignParamsDto) {
    return this.marketingCampaignService.findList(dto);
  }

  marketingCampaignAddBasket(dto: MCBasketParamsDto) {
    return this.mcBasketService.add(dto);
  }

  findGiftList(dto: GiftDto) {
    return this.giftService.findList(dto);
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
    result.sort((a, b) => {
      if (a.dateEnd === b.dateEnd) {
        return 0;
      }
      if (!a.dateEnd) {
        return 1;
      }
      if (!b.dateEnd) {
        return -1;
      }
      return a.dateEnd > b.dateEnd ? 1 : -1;
    });

    return plainToClass(StockListEntity, result, { exposeUnsetFields: false });
  }
}
