import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { PriceService } from 'src/catalog/price/price.service';
import { BasketEntity } from './entities/basket.entity';

@Injectable()
export class BasketService {
  qb: Knex;

  constructor(
    configService: ConfigService,
    private priceService: PriceService,
  ) {
    this.qb = configService.get('knex');
  }

  async findSaveData(offerId: number, countryId: number) {
    const basketData = new BasketEntity();
    basketData.productId = offerId;
    return basketData;
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
