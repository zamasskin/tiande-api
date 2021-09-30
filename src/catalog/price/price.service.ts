import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { PriceModel } from './models/price.model';
import * as _ from 'lodash';

type priceType = 'catalog' | 'bal' | 'loyalty';

@Injectable()
export class PriceService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  // получение цен
  findPriceByProductsId(productId: number[], countryId: number) {
    return this.findPricesByProductIdAndType(productId, countryId, 'catalog');
  }

  // получение цен балл
  findPriceBalByProductsId(productId: number[], countryId: number) {
    return this.findPricesByProductIdAndType(productId, countryId, 'bal');
  }

  // получение цен по программе лояльности
  findPriceLoyaltyByProductsId(productId: number[], countryId: number) {
    return this.findPricesByProductIdAndType(productId, countryId, 'loyalty');
  }

  async findPricesByProductIdAndType(
    productId: number[],
    countryId: number,
    type: priceType,
  ): Promise<{ id: number; price: number }[]> {
    if (productId.length === 0) {
      return [];
    }
    const defaultPrices = productId.map((id) => ({ id, price: 0 }));
    const priceType = await this.findPriceTypeByCountryId(countryId, type);
    const query = this.qb({ po: 'b_iblock_element_property' })
      .leftJoin({ p: 'b_catalog_price' }, (qb) =>
        qb
          .on('p.PRODUCT_ID', 'po.IBLOCK_ELEMENT_ID')
          .andOn('p.CATALOG_GROUP_ID', this.qb.raw(priceType)),
      )
      .where('po.IBLOCK_PROPERTY_ID', 111)
      .whereIn('po.VALUE', productId)
      .groupBy('po.VALUE')
      .select('po.VALUE as id', 'p.PRICE as price');
    const prices = (await query).map((p) => ({
      id: Number(p.id),
      price: Number(p.price),
    }));
    return _.unionBy(prices, defaultPrices, 'id');
  }

  async findPriceTypeByCountryId(countryId: number, type: priceType) {
    const columnName = {
      catalog: 'UF_IS_PRICE',
      bal: 'UF_IS_BALL',
      loyalty: 'UF_IS_ADD_BALL',
    };
    const result: { id: number } = await this.qb('bit_pricetype_country')
      .where('UF_COUNTRY_ID', countryId)
      .where(columnName[type], 1)
      .select('UF_PRICE_TYPE_ID as id')
      .first();
    return Number(result.id) || 0;
  }
}
