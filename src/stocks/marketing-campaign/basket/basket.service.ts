import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { ProductService } from 'src/catalog/product/product.service';
import { BasketService as SaleBasketService } from 'src/sale/basket/basket.service';
import { BasketEntity } from 'src/sale/basket/entities/basket.entity';
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
    const productId = await this.productService.findProductByOfferId(
      dto.offerId,
    );

    const checkBasket = await this.checkBasket(dto);
    if (!checkBasket) {
      throw new Error('check basket error');
    }

    const checkStock = await this.mcService.checkByProductIdAndGroupId(
      productId,
      dto.stockGroupId,
      {
        guestId: dto.guestId,
        userId: dto.userId,
        countryId: dto.countryId,
        langId: 1,
      },
    );
    if (!checkStock) {
      throw new Error('check error');
    }

    const saveData = await this.findSaveData(dto, productId);
    return this.basketService.save(saveData);
  }

  async checkBasket(dto: MCBasketParamsDto) {
    const result = await this.basketService
      .basketQueryByGuestId(dto.guestId)
      .where('MARKETING_CAMPAIGN_ID', dto.stockGroupId);
    return result.length === 0;
  }

  async findSaveData(dto: MCBasketParamsDto, productId: number) {
    const [basketData, stock] = await Promise.all([
      this.basketService.findSaveData(dto),
      this.mcService.findStockByGroupAndProductId(
        dto.stockGroupId,
        productId,
        dto.countryId,
      ),
    ]);
    basketData.marketingCampaignId = dto.stockGroupId;
    basketData.oldPrice = basketData.price;
    basketData.price = stock.calculate(basketData.price);
    return basketData;
  }
}
