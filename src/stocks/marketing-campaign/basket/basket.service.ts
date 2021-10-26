import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { CurrencyService } from 'src/catalog/currency/currency.service';
import { ProductService } from 'src/catalog/product/product.service';
import { LangService } from 'src/configurations/lang/lang.service';
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
    private currencyService: CurrencyService,
    private langService: LangService,
  ) {
    this.qb = configService.get('knex');
  }

  async add(dto: MCBasketParamsDto) {
    const checkBasket = await this.checkBasket(dto);
    if (!checkBasket) {
      throw new Error('check basket error');
    }

    const checkStock = await this.mcService.check(dto.stockId, {
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

  async findAvailableStocks(dto: MarketingCampaignParamsDto) {
    const stocks = await this.mcService.findItemsRaw(dto);
    const stocksId = stocks.map((stock) => stock.id);
    const orderStocks =
      await this.mcService.findBasketOrderByMarketingCampaignId(
        dto.userId,
        stocksId,
      );
    return stocks.filter((stock) => !orderStocks.includes(stock.id));
  }

  async checkAndUpdate(dto: MarketingCampaignParamsDto): Promise<void> {
    const [basketList, stocks] = await Promise.all([
      this.basketService.findBasketRaw(dto.guestId),
      this.findAvailableStocks(dto),
    ]);

    await Promise.all([
      this.activateCanBay(basketList, stocks),
      this.deactivateCanBay(basketList, stocks),
    ]);
  }

  async checkBasket(dto: MCBasketParamsDto) {
    const result = await this.basketService
      .basketQueryByGuestId(dto.guestId)
      .where('MARKETING_CAMPAIGN_ID', dto.stockId);
    return result.length === 0;
  }

  async findSaveData(dto: MCBasketParamsDto) {
    const lang = await this.langService.findById(dto.langId);
    const [basketData, stock, converter] = await Promise.all([
      this.basketService.findSaveData(dto),
      this.mcService.getItemById(dto.stockId),
      this.currencyService.findConverter(lang.code, dto.currency),
    ]);
    basketData.marketingCampaignId = dto.stockId;
    basketData.oldPrice = converter.formatNumber(basketData.price);
    basketData.price = stock.calculate(basketData.price);
    basketData.price = converter.formatNumber(basketData.price);
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
