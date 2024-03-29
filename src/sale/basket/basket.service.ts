import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { classToPlain, plainToClass } from 'class-transformer';
import knex, { Knex } from 'knex';
import { CurrencyService } from 'src/catalog/currency/currency.service';
import { MessageService } from 'src/catalog/message/message.service';
import { PriceService } from 'src/catalog/price/price.service';
import { ProductService } from 'src/catalog/product/product.service';
import { CountryService } from 'src/configurations/country/country.service';
import { ElementService } from 'src/iblock/element/element.service';
import { BasketDto } from './dto/basket.dto';
import { BasketEntity } from './entities/basket.entity';

@Injectable()
export class BasketService {
  qb: Knex;

  constructor(
    configService: ConfigService,
    private priceService: PriceService,
    private productService: ProductService,
    private currencyService: CurrencyService,
    private countryService: CountryService,
    private elementService: ElementService,
    private messageService: MessageService,
  ) {
    this.qb = configService.get('knex');
  }

  basketQueryByGuestId(guestId: number) {
    return this.qb('b_sale_basket')
      .where('FUSER_ID', guestId)
      .whereNull('ORDER_ID');
  }

  getTable() {
    return this.qb('b_sale_basket');
  }

  async findBasketRaw(guestId: number) {
    return plainToClass<BasketEntity, Object[]>(
      BasketEntity,
      await this.basketQueryByGuestId(guestId),
    );
  }

  async findPromoCodes(guestId: number): Promise<string[]> {
    const basketList = plainToClass<BasketEntity, Object[]>(
      BasketEntity,
      await this.basketQueryByGuestId(guestId)
        .whereNotNull('DISCOUNT_COUPON')
        .where('DISCOUNT_COUPON', '<>', '')
        .groupBy('DISCOUNT_COUPON'),
    );
    return basketList.map((basket) => basket.coupon);
  }

  async findSaveData(dto: BasketDto) {
    const productId = await this.productService.findProductByOfferId(
      dto.offerId,
    );
    const [
      price,
      priceId,
      priceBal,
      currencyConverter,
      discountAfterFo,
      url,
      { name },
    ] = await Promise.all([
      // Получаем цену
      this.priceService.findPriceByProductIdAndType(
        productId,
        dto.countryId,
        'catalog',
      ),
      // Получаем ид цены
      this.priceService.findPriceIdByProductId(dto.offerId),
      // Получаем цену в балах
      this.priceService.findPriceByProductIdAndType(
        productId,
        dto.countryId,
        'bal',
      ),
      // Получаем класс для конвертации в валюту
      this.currencyService.findConverter('ru', dto.currency),
      // Настройка для определения скидки
      this.countryService.findDiscountAfterFoById(dto.countryId),
      // Получение ссылки на продукт
      this.elementService.findUrlById(productId),
      // Получение переведенного названия
      this.messageService.findLangFieldsByProductId(productId, dto.langId),
    ]);

    const convertPrice = currencyConverter.formatNumber(price);
    if (!convertPrice) {
      throw new Error('price required');
    }

    const basketData = new BasketEntity();
    basketData.productId = dto.offerId;
    basketData.priceId = priceId;
    basketData.price = price;
    basketData.priceBal = priceBal;
    basketData.currency = dto.currency;
    basketData.quantity = dto.quantity;
    basketData.sku = dto.sku;
    basketData.guestId = dto.guestId;
    basketData.additionalDiscount = discountAfterFo;
    basketData.productUrl = url;
    basketData.name = name;
    return basketData;
  }

  async save(basket: BasketEntity) {
    const basketFields = classToPlain(basket, {
      exposeUnsetFields: false,
    });
    const [id] = await this.qb('b_sale_basket').insert(basketFields);
    return id;
  }

  setCanBayById(canBay: boolean, id: number | number[]) {
    const query = this.qb('b_sale_basket').update({
      CAN_BUY: canBay ? 'Y' : 'N',
    });
    if (Array.isArray(id)) {
      query.whereIn('ID', id);
    } else {
      query.where('ID', id);
    }
    return query;
  }

  async findProductStockId(offerId: number, countryId: number) {
    const productStock = await this.qb({ p1: 'b_iblock_element_property' })
      .leftJoin(
        {
          p2: 'b_iblock_element_prop_m27',
        },
        (qb) =>
          qb
            .on('p2.IBLOCK_ELEMENT_ID', 'p1.VALUE')
            .andOnIn('p2.IBLOCK_PROPERTY_ID', [599, 600]),
      )
      .leftJoin({ e: 'b_iblock_element' }, 'e.ID', 'p2.VALUE')
      .leftJoin(
        { c: 'b_bit_catalog_element_country' },
        'c.UF_XML_ID',
        'e.XML_ID',
      )
      .where('p1.IBLOCK_PROPERTY_ID', 111)
      .where('c.UF_COUNTRY', countryId)
      .where('p1.IBLOCK_ELEMENT_ID', offerId)
      .select('e.ID as id');

    return productStock.map(({ id }) => Number(id));
  }
}
