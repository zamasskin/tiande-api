import { Module } from '@nestjs/common';
import { MarketingCampaignModule } from './marketing-campaign/marketing-campaign.module';
import { GiftModule } from './gift/gift.module';

@Module({
  imports: [MarketingCampaignModule, GiftModule],
  exports: [MarketingCampaignModule, GiftModule],
})
export class StocksModule {}
