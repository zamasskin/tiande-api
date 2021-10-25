import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { ProductService } from 'src/catalog/product/product.service';
import { BasketService as SaleBasketService } from 'src/sale/basket/basket.service';
import { BasketEntity } from 'src/sale/basket/entities/basket.entity';
import { MarketingCampaignParamsDto } from '../dto/marketing-campaign-params.dto';
import { MarketingCampaignEntity } from '../entities/marketing-campaign.entity';
import { MarketingCampaignService } from '../marketing-campaign.service';
import { MCBasketParamsDto } from './dto/mc-basket-params.dto';

@Injectable()
export class BasketService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private productService: ProductService,
    private mcService: MarketingCampaignService,
    private basketService: SaleBasketService,
  ) {
    this.qb = configService.get('knex');
  }

  async add(dto: MCBasketParamsDto) {
    const checkBasket = await this.checkBasket(dto);
    if (!checkBasket) {
      throw new Error('check basket error');
    }

    const checkStock = await this.mcService.check(dto.stockGroupId, {
      guestId: dto.guestId,
      userId: dto.userId,
      countryId: dto.countryId,
      langId: 1,
    });
    if (!checkStock) {
      throw new Error('check error');
    }

    const saveData = await this.findSaveData(dto);
    return this.basketService.save(saveData);
  }

  async checkAndUpdate(dto: MarketingCampaignParamsDto): Promise<void> {
    const [basketList, stocks] = await Promise.all([
      this.basketService.findBasketRaw(dto.guestId),
      this.mcService.findList(dto),
    ]);

    await Promise.all([
      this.activateCanBay(basketList, stocks),
      this.deactivateCanBay(basketList, stocks),
    ]);
  }

  async checkBasket(dto: MCBasketParamsDto) {
    const result = await this.basketService
      .basketQueryByGuestId(dto.guestId)
      .where('MARKETING_CAMPAIGN_ID', dto.stockGroupId);
    return result.length === 0;
  }

  async findSaveData(dto: MCBasketParamsDto) {
    const [basketData, stock] = await Promise.all([
      this.basketService.findSaveData(dto),
      this.mcService.getItemById(dto.stockGroupId),
    ]);
    basketData.marketingCampaignId = dto.stockGroupId;
    basketData.oldPrice = basketData.price;
    basketData.price = stock.calculate(basketData.price);
    return basketData;
  }

  async activateCanBay(
    basketList: BasketEntity[],
    stocks: MarketingCampaignEntity[],
  ) {
    const basketListForActivate = basketList.filter(
      (b) => b.canBay === false && b.marketingCampaignId > 0,
    );
    if (basketListForActivate.length === 0) {
      return [];
    }
    const productsId = basketListForActivate.map((b) => b.productId);
    const productOffers = await this.productService.findProductsByOfferId(
      productsId,
    );
    const activateBasketList = basketListForActivate.filter((basket) => {
      const { productId } = productOffers.find(
        (po) => po.offerId === basket.productId,
      );

      return !!stocks.find(
        (s) =>
          s.groupInfo.id === basket.marketingCampaignId && s.id === productId,
      );
    });
    const activateId = activateBasketList.map((b) => b.id);
    if (activateId.length > 0) {
      await this.basketService.setCanBayById(true, activateId);
    }
    return activateId;
  }

  async deactivateCanBay(
    basketList: BasketEntity[],
    stocks: MarketingCampaignEntity[],
  ) {
    const basketListForActivate = basketList.filter(
      (b) => b.canBay === true && b.marketingCampaignId > 0,
    );
    if (basketListForActivate.length === 0) {
      return [];
    }
    const productsId = basketListForActivate.map((b) => b.productId);
    const productOffers = await this.productService.findProductsByOfferId(
      productsId,
    );
    const deactivateBasketList = basketListForActivate.filter((basket) => {
      const { productId } = productOffers.find(
        (po) => po.offerId === basket.productId,
      );

      return !stocks.find(
        (s) =>
          s.groupInfo.id === basket.marketingCampaignId && s.id === productId,
      );
    });
    const deactivateId = deactivateBasketList.map((b) => b.id);
    if (deactivateId.length > 0) {
      await this.basketService.setCanBayById(false, deactivateId);
    }
    return deactivateId;
  }
}
