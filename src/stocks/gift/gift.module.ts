import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from 'src/catalog/catalog.module';
import configuration from 'src/config/configuration';
import { ConfigurationsModule } from '../../configurations/configurations.module';
import { IblockModule } from 'src/iblock/iblock.module';
import { GiftService } from './gift.service';
import { MarketingCampaignModel } from '../marketing-campaign/models/marketing-campaign.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CatalogModule,
    IblockModule,
    ConfigurationsModule,
    MarketingCampaignModel,
  ],
  providers: [GiftService],
  exports: [GiftService],
})
export class GiftModule {}
