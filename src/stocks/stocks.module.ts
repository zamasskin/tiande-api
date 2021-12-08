import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { MarketingCampaignService } from './marketing-campaign/marketing-campaign.service';
import { MCBasketService } from './marketing-campaign/basket/basket.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { GiftService } from './gift/gift.service';
import { CatalogModule } from 'src/catalog/catalog.module';
import { IblockModule } from 'src/iblock/iblock.module';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { BasketModule } from 'src/sale/basket/basket.module';
import { MainModule } from 'src/main/main.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CatalogModule,
    IblockModule,
    ConfigurationsModule,
    BasketModule,
    MainModule,
  ],
  exports: [
    StocksService,
    MarketingCampaignService,
    MCBasketService,
    GiftService,
  ],
  providers: [
    StocksService,
    MarketingCampaignService,
    MCBasketService,
    GiftService,
  ],
})
export class StocksModule {}
