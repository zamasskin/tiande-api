import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketingCampaignParamsDto } from './dto/marketing-campaign-params.dto';
import { Knex } from 'knex';
import { plainToClass } from 'class-transformer';
import { MarketingCampaignGroupModel } from './models/marketing-campaign-group.model';
import { PriceService } from '../../catalog/price/price.service';
import { ElementService } from '../../iblock/element/element.service';
import { MessageService } from '../../catalog/message/message.service';
import { LangService } from '../../configurations/lang/lang.service';
import * as _ from 'lodash';
import { ElementModel } from '../../iblock/element/models/element.model';
import { MarketingCampaignModel } from './models/marketing-campaign.model';
import { CurrencyService } from '../../catalog/currency/currency.service';
import { MarketingCampaignEntity } from './entities/marketing-campaign.entity';
import { ProductService } from '../../catalog/product/product.service';

@Injectable()
export class MarketingCampaignService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private priceService: PriceService,
    private elementService: ElementService,
    private messageService: MessageService,
    private langService: LangService,
    private currencyService: CurrencyService,
    private productService: ProductService,
  ) {
    this.qb = configService.get('knex');
  }
  async findList(dto: MarketingCampaignParamsDto) {
    const groups = await this.findGroup(dto.userId);
    const groupsId = groups.map((g) => g.id);
    const [lang, items] = await Promise.all([
      this.langService.findById(dto.langId),
      this.findItemsByGroupId(groupsId, dto),
    ]);
    const productId = items.map((item) => item.productId);
    const products = await this.findProducts(dto, productId);
    const converter = await this.currencyService.findConverter(
      lang.code,
      await this.currencyService.findCurrencyByCountry(dto.countryId),
    );
    const mcItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const discountPrice = item.calculate(product?.price || 0);
      const groupInfo = groups.find((g) => g.id === item.groupId);
      return {
        ...product,
        groupInfo,
        stockInfo: {
          ...item,
          discountPercent: item.discountPercent,
          price: discountPrice,
          priceFormat: converter.format(discountPrice),
        },
      };
    });
    return plainToClass(MarketingCampaignEntity, mcItems, {
      excludeExtraneousValues: true,
    });
  }

  getItemsQuery() {
    return this.qb({ mc: 'b_marketing_campaign' })
      .leftJoin({ c: 'b_marketing_campaign_uf_country' }, 'c.ID', 'mc.ID')
      .leftJoin({ p: 'b_marketing_campaign_uf_product_id' }, 'p.ID', 'mc.ID');
  }

  getItemsQueryByGroupIdAndCountry(groupsId: number[], countryId: number) {
    return this.getItemsQuery()
      .whereIn('mc.UF_GROUP_ID', groupsId)
      .where('c.VALUE', countryId);
  }

  async findItemsRaw(dto: MarketingCampaignParamsDto) {
    const groups = await this.findGroup(dto.userId);
    const groupsId = groups.map((g) => g.id);
    return this.findItemsRawByGroupId(groupsId, dto);
  }

  async findItems(dto: MarketingCampaignParamsDto) {
    const groups = await this.findGroup(dto.userId);
    const groupsId = groups.map((g) => g.id);
    return this.findItemsByGroupId(groupsId, dto);
  }

  async findItemsRawByGroupId(
    groupsId: number[],
    dto: MarketingCampaignParamsDto,
  ) {
    const lang = await this.langService.findById(dto.langId);
    const query = this.getItemsQueryByGroupIdAndCountry(groupsId, dto.countryId)
      .select(
        '*',
        `mc.UF_DESCRIPTION_${lang.code.toUpperCase()} as UF_DESCRIPTION`,
        'p.VALUE as PRODUCT_ID',
      )
      .groupBy('p.VALUE');
    return plainToClass<MarketingCampaignModel, Object[]>(
      MarketingCampaignModel,
      await query,
    );
  }

  async findItemsByGroupId(
    groupsId: number[],
    dto: MarketingCampaignParamsDto,
  ): Promise<MarketingCampaignModel[]> {
    const [items, basket] = await Promise.all([
      this.findItemsRawByGroupId(groupsId, dto),
      this.findBasketMarketingCampaignId(dto.guestId),
    ]);

    const itemsId = items.map((item) => item.id);
    const order = await this.findBasketOrderByMarketingCampaignId(
      dto.userId,
      itemsId,
    );
    const excludeId = [...basket, ...order];
    return items.filter((item) => !excludeId.includes(item.id));
  }

  async getItemById(id: number) {
    const item = await this.getItemsQuery().where('mc.ID', id).first();
    return plainToClass(MarketingCampaignModel, item);
  }

  async findProducts(dto: MarketingCampaignParamsDto, productId: number[]) {
    const lang = await this.langService.findById(dto.langId);
    const [elements, properties, prices, pricesBal, messages, elementUrls] =
      await Promise.all([
        this.elementService.findElementsRawById(productId),
        this.productService.findPropertiesBuProductsId(productId),
        this.priceService.findPriceFormatByProductsId(
          productId,
          dto.countryId,
          lang.code,
        ),
        this.priceService.findPriceBalFormatByProductsId(
          productId,
          dto.countryId,
          lang.code,
        ),
        this.messageService.findLangFieldsByProductsId(productId, lang.id),
        this.elementService.findUrlsById(productId),
      ]);
    return productId.map((id) => {
      const element = elements.find((e) => e.id === id) || new ElementModel();
      const props = properties.find((p) => p.id === id);
      const price = prices.find((p) => p.id === id);
      const priceBal = pricesBal.find((p) => p.id === id);
      const message = messages.find((m) => m.id === id);
      const url = elementUrls.find((e) => e.id === id);

      return {
        ...element,
        ...props,
        price: price?.price || 0,
        priceFormat: price?.priceFormat || '',
        priceBal: priceBal?.price || 0,
        priceBalFormat: priceBal?.priceFormat || '',
        ...message,
        ...url,
        id,
      };
    });
  }

  // Запрос без доп фильтров для получения групп
  groupQuery(): Knex.QueryBuilder {
    return this.qb({ g: 'b_marketing_campaign_group' })
      .where((qb) =>
        qb
          .where('g.UF_DATE_START', '<=', new Date())
          .orWhereNull('g.UF_DATE_START'),
      )
      .where((qb) =>
        qb
          .where('g.UF_DATE_END', '>=', new Date())
          .orWhereNull('g.UF_DATE_END'),
      )
      .where('g.UF_ACTIVE', 1);
  }

  // Получаем список групп
  async findGroup(userId: number): Promise<MarketingCampaignGroupModel[]> {
    return userId ? this.findGroupByUser(userId) : this.findGroupByGuest();
  }

  // Отдаем группы для не зарегистрированного пользователя
  async findGroupByGuest(): Promise<MarketingCampaignGroupModel[]> {
    return plainToClass<MarketingCampaignGroupModel, Object[]>(
      MarketingCampaignGroupModel,
      await this.groupQuery(),
    );
  }

  // Отдаем группы для зарегистрированного пользователя с доп проверками
  async findGroupByUser(
    userId: number,
  ): Promise<MarketingCampaignGroupModel[]> {
    const dateRegister = await this.findDateRegister(userId);
    const queryBuilder = this.groupQuery();
    const groups = await queryBuilder
      .where((qb) =>
        qb
          .whereNull('g.UF_REGISTER_START')
          .orWhere('g.UF_REGISTER_START', '<=', dateRegister),
      )
      .where((qb) =>
        qb
          .whereNull('g.UF_REGISTER_END')
          .orWhere('g.UF_REGISTER_END', '>=', dateRegister),
      );
    return plainToClass<MarketingCampaignGroupModel, Object[]>(
      MarketingCampaignGroupModel,
      groups,
    );
  }

  // Получаем дату регистрации пользователя
  async findDateRegister(userId: number) {
    const { dateRegister } = await this.qb('b_user')
      .select('DATE_REGISTER as dateRegister')
      .where('ID', userId)
      .first();
    return dateRegister;
  }

  // Запросим из корзины товары которые являются акциями
  async findBasketMarketingCampaignId(guestId: number): Promise<number[]> {
    const basketList = await this.qb('b_sale_basket')
      .where('FUSER_ID', guestId)
      .whereNull('ORDER_ID')
      .whereNotNull('MARKETING_CAMPAIGN_ID')
      .where('MARKETING_CAMPAIGN_ID', '<>', 0)
      .select('MARKETING_CAMPAIGN_ID as marketingCampaignId');
    return basketList.map((basket) => Number(basket.marketingCampaignId));
  }

  // Ищем в неотмененных заказах акции не
  // разрешенные к повторному использованию
  async findBasketOrderByMarketingCampaignId(
    userId: number,
    marketingCampaignId: number[],
  ): Promise<number[]> {
    if (!userId || marketingCampaignId.length === 0) {
      return [];
    }
    const groups = await this.qb({ o: 'b_sale_order' })
      .leftJoin({ b: 'b_sale_basket' }, 'b.ORDER_ID', 'o.ID')
      .leftJoin(
        { m: 'b_marketing_campaign' },
        'm.ID',
        'b.MARKETING_CAMPAIGN_ID',
      )
      .leftJoin({ mg: 'b_marketing_campaign_group' }, 'mg.ID', 'm.UF_GROUP_ID')
      .where('o.USER_ID', userId)
      .where('o.CANCELED', 'N')
      .where('mg.UF_REPEAT_ORDER', '<>', 1)
      .whereIn('b.MARKETING_CAMPAIGN_ID', marketingCampaignId)
      .groupBy('b.MARKETING_CAMPAIGN_ID')
      .select('b.MARKETING_CAMPAIGN_ID as marketingCampaignId');
    return groups.map((group) => Number(group.marketingCampaignId));
  }

  async checkByProductIdAndGroupId(
    productId: number,
    groupId: number,
    dto: MarketingCampaignParamsDto,
  ) {
    const stockList = await this.findList(dto);
    const id = stockList
      .filter((s) => s.groupInfo.id === groupId)
      .map((s) => s.id);
    return id.includes(productId);
  }

  async findStockByGroupAndProductId(
    groupId: number,
    productId: number,
    countryId: number,
  ): Promise<MarketingCampaignModel> {
    const query = this.getItemsQueryByGroupIdAndCountry([groupId], countryId)
      .where('p.VALUE', productId)
      .select(
        '*',
        `mc.UF_DESCRIPTION_RU as UF_DESCRIPTION`,
        'p.VALUE as PRODUCT_ID',
      );
    return plainToClass(MarketingCampaignModel, await query.first());
  }

  async check(stockId: number, dto: MarketingCampaignParamsDto) {
    const stocks = await this.findItems(dto);
    const stocksId = stocks.map((stock) => stock.id);
    return stocksId.includes(stockId);
  }
}
