import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { ProductService } from 'src/catalog/product/product.service';
import { BasketService as SaleBasketService } from 'src/sale/basket/basket.service';
import { BasketEntity } from 'src/sale/basket/entities/basket.entity';
import { MarketingCampaignParamsDto } from '../dto/marketing-campaign-params.dto';
import { MarketingCampaignService } from '../marketing-campaign.service';
import { MarketingCampaignModel } from '../models/marketing-campaign.model';
import { MCBasketParamsDto } from './dto/mc-basket-params.dto';

@Injectable()
export class BasketService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private productService: ProductService,
    private mcService: MarketingCampaignService,
    private basketService: SaleBasketService,
  ) {
    this.qb = configService.get('knex');
  }

  async add(dto: MCBasketParamsDto) {
    const checkBasket = await this.checkBasket(dto);
    if (!checkBasket) {
      throw new Error('check basket error');
    }

    const checkStock = await this.mcService.check(dto.stockGroupId, {
      guestId: dto.guestId,
      userId: dto.userId,
      countryId: dto.countryId,
      langId: 1,
    });
    if (!checkStock) {
      throw new Error('check error');
    }

    const saveData = await this.findSaveData(dto);
    return this.basketService.save(saveData);
  }

  async checkAndUpdate(dto: MarketingCampaignParamsDto): Promise<void> {
    const [basketList, stocks] = await Promise.all([
      this.basketService.findBasketRaw(dto.guestId),
      this.mcService.findItemsRaw(dto),
    ]);

    await Promise.all([
      this.activateCanBay(basketList, stocks),
      this.deactivateCanBay(basketList, stocks),
    ]);
  }

  async checkBasket(dto: MCBasketParamsDto) {
    const result = await this.basketService
      .basketQueryByGuestId(dto.guestId)
      .where('MARKETING_CAMPAIGN_ID', dto.stockGroupId);
    return result.length === 0;
  }

  async findSaveData(dto: MCBasketParamsDto) {
    const [basketData, stock] = await Promise.all([
      this.basketService.findSaveData(dto),
      this.mcService.getItemById(dto.stockGroupId),
    ]);
    basketData.marketingCampaignId = dto.stockGroupId;
    basketData.oldPrice = basketData.price;
    basketData.price = stock.calculate(basketData.price);
    return basketData;
  }

  async activateCanBay(
    basketList: BasketEntity[],
    stocks: MarketingCampaignModel[],
  ) {
    const stocksId = stocks.map((stock) => stock.id);
    const basketListForActivate = basketList.filter(
      (b) => b.canBay === false && stocksId.includes(b.marketingCampaignId),
    );
    if (basketListForActivate.length === 0) {
      return [];
    }
    const activateId = basketListForActivate.map((b) => b.id);
    if (activateId.length > 0) {
      await this.basketService.setCanBayById(true, activateId);
    }
    return activateId;
  }

  async deactivateCanBay(
    basketList: BasketEntity[],
    stocks: MarketingCampaignModel[],
  ) {
    const stocksId = stocks.map((stock) => stock.id);
    const basketListForActivate = basketList.filter(
      (b) =>
        b.canBay === true &&
        b.marketingCampaignId > 0 &&
        !stocksId.includes(b.marketingCampaignId),
    );
    const deactivateId = basketListForActivate.map((b) => b.id);
    if (deactivateId.length > 0) {
      await this.basketService.setCanBayById(false, deactivateId);
    }
    return deactivateId;
  }
}
