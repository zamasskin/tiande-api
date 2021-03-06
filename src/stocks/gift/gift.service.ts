import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import * as _ from 'lodash';
import { CurrencyService } from 'src/catalog/currency/currency.service';
import { MarketingCampaignService } from '../marketing-campaign/marketing-campaign.service';
import { GiftDto } from './dto/gift.dto';
import { GiftEntity } from './entities/gift.entity';
import { BasketGiftModel } from './models/basket-gift.model';
import { PromotionGiftModel } from './models/promotion-gift.model';
import { LangService } from '../../configurations/lang/lang.service';
import { CountryService } from 'src/configurations/country/country.service';

@Injectable()
export class GiftService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private marketingCampaignService: MarketingCampaignService,
    private currencyService: CurrencyService,
    private langService: LangService,
    private countryService: CountryService,
  ) {
    this.qb = configService.get('knex');
  }

  async findList(dto: GiftDto): Promise<GiftEntity[]> {
    const [giftOptions, basketGifts] = await Promise.all([
      this.findGiftOptions(dto.userId),
      this.findBasketGifts(dto.guestId),
    ]);

    const { currency } = await this.countryService.findById(dto.countryId);
    const lang = await this.langService.findById(dto.langId);
    const [converterBal, converterCur] = await Promise.all([
      this.currencyService.findConverter(lang.code, 'BAL'),
      this.currencyService.findConverter(lang.code, currency),
    ]);

    if (giftOptions.length === 0) {
      return [];
    }
    const id = _.uniq(giftOptions.map((g) => g.productId));
    const products = await this.marketingCampaignService.findProducts(dto, id);
    const result = giftOptions.map((gift) => {
      const used = !!basketGifts.find((b) => b.giftId === gift.id);
      const product = products.find((p) => p.id === gift.productId);
      product.priceBal = 0;
      product.priceBalFormat = converterBal.format(0);
      return {
        ...product,
        giftInfo: {
          ...gift,
          used,
          price: 0,
          priceFormat: converterCur.format(0),
        },
      };
    });
    return plainToClass(
      GiftEntity,
      result.filter(({ giftInfo: { used } }) => !used),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async findGiftOptions(userId: number): Promise<PromotionGiftModel[]> {
    return plainToClass<PromotionGiftModel, Object[]>(
      PromotionGiftModel,
      await this.qb('promotion_gift')
        .where('UF_USER', userId)
        .where((qb) => qb.where('UF_ISSUED', 0).orWhereNull('UF_ISSUED')),
    );
  }

  async findBasketGifts(guestId: number): Promise<BasketGiftModel[]> {
    return plainToClass<BasketGiftModel, Object[]>(
      BasketGiftModel,
      await this.qb({ b: 'b_sale_basket' })
        .leftJoin({ p: 'b_iblock_element_property' }, (qb) =>
          qb
            .on('p.IBLOCK_ELEMENT_ID', 'b.PRODUCT_ID')
            .andOn('p.IBLOCK_PROPERTY_ID', this.qb.raw(111)),
        )
        .whereNull('b.ORDER_ID')
        .where('b.FUSER_ID', guestId)
        .where('b.PROMOTION_GIFT_ID', '>', 0)
        .select('*', 'p.VALUE as ELEMENT_ID'),
    );
  }
}
