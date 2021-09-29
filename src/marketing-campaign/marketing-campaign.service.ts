import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketingCampaignParamsDto } from './dto/marketing-campaign-params.dto';
import { Knex } from 'knex';
import { plainToClass } from 'class-transformer';
import { MarketingCampaignGroupModel } from './models/marketing-campaign-group.model';

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
  async findGroupId(userId: number): Promise<number[]> {
    const groupId = (await userId)
      ? this.findGroupByUser(userId)
      : this.findGroupByGuest();
    return [1];
  }

  // Отдаем группы для не зарегистрированного пользователя
  async findGroupByGuest(): Promise<MarketingCampaignGroupModel[]> {
    return plainToClass<MarketingCampaignGroupModel, Object[]>(
      MarketingCampaignGroupModel,
      await this.groupQuery(),
    );
  }

  // Отдаем группы для зарегистрированного пользователя с доп проверками
  async findGroupByUser(
    userId: number,
  ): Promise<MarketingCampaignGroupModel[]> {
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
    return plainToClass<MarketingCampaignGroupModel, Object[]>(
      MarketingCampaignGroupModel,
      groups,
    );
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

  // Ищем в неотмененных заказах акции не
  // разрешенные к повторному использованию
  async findBasketOrderByMarketingCampaignId(
    userId: number,
    marketingCampaignId: number[],
  ): Promise<number[]> {
    const groups = await this.qb({ o: 'b_sale_order' })
      .leftJoin({ b: 'b_sale_basket' }, 'b.ORDER_ID', 'o.ID')
      .where('o.USER_ID', userId)
      .where('o.CANCELED', 'N')
      .whereIn('b.MARKETING_CAMPAIGN_ID', marketingCampaignId)
      .groupBy('b.MARKETING_CAMPAIGN_ID')
      .select('b.MARKETING_CAMPAIGN_ID as marketingCampaignId');
    return groups.map((group) => Number(group.marketingCampaignId));
  }
}
