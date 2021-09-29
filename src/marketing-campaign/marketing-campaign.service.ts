import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketingCampaignParamsDto } from './dto/marketing-campaign-params.dto';
import { Knex } from 'knex';

@Injectable()
export class MarketingCampaignService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }
  async findList(parameters: MarketingCampaignParamsDto) {
    const groupsId = await this.findGroupId(Number(parameters.userId));
    return {
      id: 10,
    };
  }

  // Приводим ид группы к числу
  mapGroup(group: { id: number | string }) {
    return Number(group.id);
  }

  // Запрос без доп фильтров для получения групп
  groupQuery(): Knex.QueryBuilder {
    return this.qb({ g: 'b_marketing_campaign_group' })
      .select('g.ID as id')
      .where('g.UF_DATE_START', '<=', new Date())
      .where('g.UF_DATE_END', '>=', new Date())
      .where('g.UF_ACTIVE', 1);
  }

  // Получаем ид групп
  findGroupId(userId: number): Promise<number[]> {
    return userId
      ? this.findGroupIdByUser(userId)
      : this.findGroupIdByGuestId();
  }

  // Отдаем группы для не зарегистрированного пользователя
  async findGroupIdByGuestId() {
    return (await this.groupQuery()).map(this.mapGroup);
  }

  // Отдаем группы для зарегистрированного пользователя с доп проверками
  async findGroupIdByUser(userId: number): Promise<number[]> {
    const dateRegister = await this.findDateRegister(userId);
    const queryBuilder = this.groupQuery();
    const groups = await queryBuilder
      .where((qb) =>
        qb
          .whereNull('g.UF_REGISTER_START')
          .orWhere('g.UF_REGISTER_START', '<=', dateRegister),
      )
      .where((qb) =>
        qb
          .whereNull('g.UF_REGISTER_END')
          .orWhere('g.UF_REGISTER_END', '>=', dateRegister),
      );
    return groups.map(this.mapGroup);
  }

  // Получаем дату регистрации пользователя
  async findDateRegister(userId: number) {
    const { dateRegister } = await this.qb('b_user')
      .select('DATE_REGISTER as dateRegister')
      .where('ID', userId)
      .first();
    return dateRegister;
  }

  // Запросим из корзины товары которые являются акциями
  async findBasketFromMarketingCampaignId(guestId: number): Promise<number[]> {
    const basketList = await this.qb('b_sale_basket')
      .where('FUSER_ID', guestId)
      .whereNull('ORDER_ID')
      .whereNotNull('MARKETING_CAMPAIGN_ID')
      .where('MARKETING_CAMPAIGN_ID', '<>', 0)
      .select('MARKETING_CAMPAIGN_ID as marketingCampaignId');
    return basketList.map((basket) => Number(basket.marketingCampaignId));
  }
}
