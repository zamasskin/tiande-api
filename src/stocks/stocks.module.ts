import { Module } from '@nestjs/common';
import { MarketingCampaignModule } from './marketing-campaign/marketing-campaign.module';

@Module({
  imports: [MarketingCampaignModule],
  exports: [MarketingCampaignModule],
})
export class StocksModule {}
