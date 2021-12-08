import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { PromoCodeDto } from './dto/promocode.dto';
import { CashbackEntity } from './entities/cashback.entity';

@Injectable()
export class PromoCodeService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  getActionByUserQuery(dto: PromoCodeDto) {
    return this.qb('t_promo_action_by_user')
      .where('UF_COUNTRY', dto.countryId)
      .where('UF_FOUND_BY', 'code')
      .where((qb) =>
        qb.where('UF_USER_ID', dto.userId).orWhere('UF_USER_HASH', dto.guestId),
      );
  }

  async findCashback(dto: PromoCodeDto) {
    const query = this.qb('t_cashback').whereIn(
      'ID',
      this.getActionByUserQuery(dto).select('UF_PROMO_ACTION_ID'),
    );
    return plainToClass<CashbackEntity, Object[]>(CashbackEntity, await query);
  }

  async findStockId(dto: PromoCodeDto) {
    const data = await this.findCashback(dto);
    return data.map((cashback) => cashback.stockId);
  }
  async checkStock(stockId: number, dto: PromoCodeDto) {
    const data = await this.findCashback(dto);
    return !!data.find((cashback) => cashback.stockId === stockId);
  }
}
