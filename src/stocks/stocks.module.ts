import { Module } from '@nestjs/common';
import { MarketingCampaignModule } from './marketing-campaign/marketing-campaign.module';
import { GiftModule } from './gift/gift.module';
import { StocksService } from './stocks.service';

@Module({
  imports: [MarketingCampaignModule, GiftModule],
  exports: [MarketingCampaignModule, GiftModule, StocksService],
  providers: [StocksService],
})
export class StocksModule {}
