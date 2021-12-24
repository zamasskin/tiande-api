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
import { PriceService } from 'src/catalog/price/price.service';
import { CountryService } from 'src/configurations/country/country.service';

@Injectable()
export class MCBasketService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private productService: ProductService,
    private mcService: MarketingCampaignService,
    private basketService: SaleBasketService,
    private currencyService: CurrencyService,
    private langService: LangService,
    private priceService: PriceService,
    private countryService: CountryService,
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
      moderate: dto.moderate,
    });
    if (!checkStock) {
      throw new Error('check error');
    }

    const saveData = await this.findSaveData(dto);
    return this.basketService.save(saveData);
  }

  async findAvailableStocks(dto: MarketingCampaignParamsDto) {
    const [stocks, cashbackStocks] = await Promise.all([
      this.mcService.findItemsRaw(dto),
      this.mcService.findItemsByCashback(dto),
    ]);
    // TODO: Если не нужно проверять по заказам то перенесем ниже
    stocks.push(...cashbackStocks);
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

    const lang = await this.langService.findById(dto.langId);
    await Promise.all([
      this.activateCanBay(basketList, stocks),
      this.deactivateCanBay(basketList, stocks),
      this.updatePrice(basketList, dto.countryId, lang.code),
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

  async updatePrice(
    basketList: BasketEntity[],
    countryId: number,
    langCode: string,
  ) {
    const basketStocks = basketList.filter(
      (basket) => basket.marketingCampaignId > 0,
    );
    if (basketStocks.length === 0) {
      return false;
    }

    const { currency } = await this.countryService.findById(countryId);

    const productId = basketStocks.map((basket) => basket.productId);

    const [prices, stocks, converter] = await Promise.all([
      this.priceService.findPricesByOfferIdAndType(
        productId,
        countryId,
        'catalog',
      ),
      Promise.all(
        basketStocks.map((basket) =>
          this.mcService.getItemById(basket.marketingCampaignId),
        ),
      ),
      this.currencyService.findConverter(langCode, currency),
    ]);

    const calculate = (stockId: number, price: number) => {
      const stock = stocks.find((stock) => stock?.id === stockId);
      if (stock) {
        price = stock.calculate(price);
        return converter.formatNumber(price);
      }
      return converter.formatNumber(price);
    };

    const getPrice = (productId: number) =>
      prices.find((price) => price.id === productId)?.price || 0;

    const updateData = [];

    basketStocks.forEach((basket) => {
      const oldPrice = getPrice(basket.productId);
      const price = calculate(basket.marketingCampaignId, oldPrice);
      if (
        Number(basket.price) !== price ||
        basket.oldPrice !== oldPrice ||
        basket.currency !== currency
      ) {
        updateData.push(
          this.qb('b_sale_basket')
            .where('ID', basket.id)
            .update({ PRICE: price, PRICE_OLD: oldPrice, CURRENCY: currency }),
        );
      }
    });
    await Promise.all(updateData);
    return true;
  }
}
