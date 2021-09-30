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
}
