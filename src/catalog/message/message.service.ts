import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { ElementItemsModel } from './models/element-items.model';
import * as _ from 'lodash';
import { CacheService } from '../../cache/cache.service';
import { Cache } from 'src/cache/decorators/cache-promise.decorator';

@Injectable()
export class MessageService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.qb = configService.get('knex');
  }

  @Cache<ElementItemsModel[]>({ ttl: 60 * 60 })
  async findLangFieldsByProductId(
    productId: number[],
    langId: number,
  ): Promise<ElementItemsModel[]> {
    const defaultLang = productId.map((id) => {
      const mess = new ElementItemsModel();
      mess.id = id;
      return mess;
    });
    const langItems = plainToClass<ElementItemsModel, Object[]>(
      ElementItemsModel,
      await this.getLangElementQuery(langId).whereIn('UF_ITEM_ID', productId),
    );
    return _.unionBy(langItems, defaultLang, 'id');
  }

  getLangElementQuery(langId: number) {
    const elementQuery = this.qb({ e: 'b_iblock_element' })
      .leftJoin(
        { p: 'b_iblock_element_prop_s27' },
        'p.IBLOCK_ELEMENT_ID',
        'e.ID',
      )
      .select(
        'e.ID AS UF_ITEM_ID',
        'e.NAME AS UF_NAME',
        'p.PROPERTY_553 AS UF_USAGE',
        'p.PROPERTY_554 AS UF_VOICE',
        'p.PROPERTY_523 AS UF_VOLUME',
        'e.PREVIEW_TEXT AS UF_PREVIEW_TEXT',
        'e.DETAIL_TEXT AS UF_DETAIL_TEXT',
        this.qb.raw('1 AS UF_LANG_ID'),
      );
    return this.qb
      .from((qb: Knex.QueryBuilder) =>
        qb
          .from('bit_item_lang_texts')
          .select(
            'UF_ITEM_ID',
            'UF_NAME',
            'UF_USAGE',
            'UF_VOICE',
            'UF_VOLUME',
            'UF_PREVIEW_TEXT',
            'UF_DETAIL_TEXT',
            'UF_LANG_ID',
          )
          .union(elementQuery)
          .as('t'),
      )
      .where('UF_LANG_ID', langId);
  }
}
