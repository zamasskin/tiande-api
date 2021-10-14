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
}
