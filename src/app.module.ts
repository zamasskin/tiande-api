import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { MarketingCampaignModule } from './marketing-campaign/marketing-campaign.module';
import { CatalogModule } from './catalog/catalog.module';
import { IblockModule } from './iblock/iblock.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { CacheModule } from './cache/cache.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ApiModule,
    MarketingCampaignModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CatalogModule,
    IblockModule,
    ConfigurationsModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
