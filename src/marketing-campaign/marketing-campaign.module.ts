import { Module } from '@nestjs/common';
import { MarketingCampaignService } from './marketing-campaign.service';
import configuration from '../config/configuration';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from '../catalog/catalog.module';
import { IblockModule } from '../iblock/iblock.module';
import { ConfigurationsModule } from '../configurations/configurations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CatalogModule,
    IblockModule,
    ConfigurationsModule,
  ],
  providers: [MarketingCampaignService],
  exports: [MarketingCampaignService],
})
export class MarketingCampaignModule {}
