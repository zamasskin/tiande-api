import * as _ from 'lodash';
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
import {
  MCBasketParamsDto,
  MCBasketPromoCodeParamsDto,
} from './dto/mc-basket-params.dto';
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

  async addByPromoCode(dto: MCBasketPromoCodeParamsDto) {
    if (!dto.userId) {
      return false;
    }
    const mcDto = {
      guestId: dto.guestId,
      userId: dto.userId,
      countryId: dto.countryId,
      langId: 1,
      moderate: dto.moderate,
    };
    const stocks = await this.mcService.findItemsByPromoCode(
      mcDto,
      dto.promoCode,
    );
    if (stocks.length === 0) {
      return false;
    }
    const stockId = stocks.map((stock) => stock.id);
    const basketItems = dto.basketItems.filter((bi) =>
      stockId.includes(Number(bi.stockId)),
    );

    if (basketItems.length === 0) {
      return false;
    }
    const results = await Promise.all(
      basketItems.map(async (bi) => {
        const basketDto = { ...dto, ...bi, quantity: 1 };
        const checkBasket = await this.checkBasket(basketDto);
        if (!checkBasket) {
          return false;
        }
        const saveData = await this.findSaveData(basketDto);
        saveData.coupon = dto.promoCode;
        return this.basketService.save(saveData);
      }),
    );
    return !!results.find((add) => !!add);
  }

  async findAvailableStocksV2(dto: MarketingCampaignParamsDto) {
    const promoCodes = await this.basketService.findPromoCodes(dto.guestId);
    const promises = [
      this.mcService.findItemsRaw(dto),
      this.mcService.findItemsByCashback(dto),
      ...promoCodes.map((promoCode) =>
        this.mcService.findItemsRawByPromoCode(dto, promoCode),
      ),
    ];
    const stocks = _.flatten(await Promise.all(promises));
    const stocksId = stocks.map((stock) => stock.id);
    const orderStocks =
      await this.mcService.findBasketOrderByMarketingCampaignId(
        dto.userId,
        stocksId,
      );
    return stocks.filter((stock) => !orderStocks.includes(stock.id));
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

  async deleteNotActive(dto: MarketingCampaignParamsDto) {
    const [activeGroups, activeGroupsByPromoCode] = await Promise.all([
      this.mcService.findGroup(dto.userId),
      this.mcService
        .groupQueryRaw()
        .where((qb) =>
          qb.whereNotNull('UF_PROMO_CODE').where('UF_PROMO_CODE', '<>', ''),
        )
        .select('ID as id'),
    ]);
    const activeGroupsId = activeGroups.map(({ id }) => id);
    const activeGroupsByPromoCodeId = activeGroupsByPromoCode.map(({ id }) =>
      Number(id),
    );
    const id = _.chain([activeGroupsId, activeGroupsByPromoCodeId])
      .flatten()
      .uniq()
      .value();

    const mcItemQuery = this.mcService
      .getItemTable()
      .select('ID')
      .whereIn(
        'ID',
        this.basketService
          .basketQueryByGuestId(dto.guestId)
          .select('MARKETING_CAMPAIGN_ID'),
      );

    if (id.length > 0) {
      mcItemQuery.whereNotIn('UF_GROUP_ID', id);
    }
    const deleteBasket = await this.basketService
      .basketQueryByGuestId(dto.guestId)
      .whereIn('MARKETING_CAMPAIGN_ID', mcItemQuery)
      .select('id');
    if (deleteBasket.length > 0) {
      const id = deleteBasket.map(({ id }) => Number(id)).filter((id) => !!id);
      await this.basketService.getTable().whereIn('ID', id).delete();
      return true;
    }
    return false;
  }

  async checkAndUpdate(dto: MarketingCampaignParamsDto): Promise<void> {
    const [basketList, stocks] = await Promise.all([
      this.basketService.findBasketRaw(dto.guestId),
      this.findAvailableStocksV2(dto),
      await this.deleteNotActive(dto),
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
