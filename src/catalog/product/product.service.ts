import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { PropertiesModel } from './models/properties.model';
import * as _ from 'lodash';

@Injectable()
export class ProductService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  async findPropertiesBuProductsId(productId: number[]) {
    const defaultProperties = productId.map((id) => {
      const property = new PropertiesModel();
      property.id = id;
      return property;
    });
    const properties = plainToClass<PropertiesModel, Object[]>(
      PropertiesModel,
      await this.qb('b_iblock_element_prop_s27').whereIn(
        'IBLOCK_ELEMENT_ID',
        productId,
      ),
    );
    return _.unionBy(properties, defaultProperties, 'id');
  }

  async findProductsByOfferId(
    id: number[],
  ): Promise<{ offerId: number; productId: number }[]> {
    const properties = await this.qb('b_iblock_element_property')
      .where('IBLOCK_PROPERTY_ID', 111)
      .whereIn('IBLOCK_ELEMENT_ID', id)
      .select('VALUE as productId', 'IBLOCK_ELEMENT_ID as offerId');

    return id.map((offerId) => {
      const property = properties.find((p) => Number(p.offerId) === offerId);
      return { offerId, productId: property?.productId || 0 };
    });
  }

  async findProductByOfferId(id: number): Promise<number> {
    const [{ productId }] = await this.findProductsByOfferId([id]);
    return productId;
  }
}
