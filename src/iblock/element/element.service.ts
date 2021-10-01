import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { ElementModel } from './models/element.model';

@Injectable()
export class ElementService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  async findElementsRawById(id: number[]) {
    return plainToClass<ElementModel, Object[]>(
      ElementModel,
      await this.qb('b_iblock_element').whereIn('ID', id),
    );
  }
}
