import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import _ from 'lodash';
import { CurrencyLangModel } from './model/currency-lang.model';

@Injectable()
export class CurrencyService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  async findCurrencyByCountry(countryId: string): Promise<string> {
    const result = await this.qb('bit_country')
      .where('ID', countryId)
      .select('UF_CURRENCY as currency')
      .first();
    return result.currency || 'RUB';
  }

  async fundConverter(lang: string, currency: string) {
    const model = await this.findModel(lang, currency);
    return {
      format: (number: number) => this.format(number, model),
      formatCeil: (number: number) => this.formatCeil(number, model),
      formatFloor: (number: number) => this.formatFloor(number, model),
      formatRaw: (number: number) => this.formatRaw(number, model),
      formatRawCeil: (number: number) => this.formatRawCeil(number, model),
      formatRawFloor: (number: number) => this.formatRawFloor(number, model),
    };
  }

  async findModel(lang: string, currency: string): Promise<CurrencyLangModel> {
    return plainToClass(
      CurrencyLangModel,
      await this.qb('b_catalog_currency_lang')
        .where('CURRENCY', currency)
        .where('LID', lang)
        .first(),
    );
  }

  numberFormat(
    price: number,
    decimals = 2,
    decPoint = '.',
    thousandsSep = ',',
    hideZero = false,
  ) {
    const reqExp = new RegExp('\\B(?=(?:\\d{3})+(?!\\d))', 'g');
    let [left, right = ''] = price.toFixed(decimals).toString().split('.');
    if (decimals > 0 && hideZero) {
      right = right.replace(/[0]+$/, '');
    }
    left = left.replace(reqExp, thousandsSep);
    return (right.length > 0 ? left + decPoint + right : left).toString();
  }

  formatRaw(price: number, model: CurrencyLangModel) {
    return this.numberFormat(
      price,
      model.decimals,
      model.decPoint,
      model.thousandsSep,
      model.hideZero,
    );
  }

  formatRawCeil(price: number, model: CurrencyLangModel) {
    const numberCeil =
      model.decimals > 0 ? _.ceil(price, model.decimals) : _.ceil(price);
    return this.formatRaw(numberCeil, model);
  }

  formatRawFloor(price: number, model: CurrencyLangModel) {
    const numberFloor =
      model.decimals > 0 ? _.floor(price, model.decimals) : _.floor(price);
    return this.formatRaw(numberFloor, model);
  }

  formatString(priceFormat: string, format: string) {
    return format.replace(/(^|[^&])#/, `$1${priceFormat}`);
  }

  format(price: number, model: CurrencyLangModel) {
    const priceFormat = this.formatRaw(price, model);
    return this.formatString(priceFormat, model.formatString);
  }

  formatCeil(price: number, model: CurrencyLangModel) {
    const priceFormat = this.formatRawCeil(price, model);
    return this.formatString(priceFormat, model.formatString);
  }

  formatFloor(price: number, model: CurrencyLangModel) {
    const priceFormat = this.formatRawFloor(price, model);
    return this.formatString(priceFormat, model.formatString);
  }
}
