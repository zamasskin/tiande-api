import { Module } from '@nestjs/common';
import { MarketingCampaignService } from './marketing-campaign.service';
import configuration from '../../src/config/configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [MarketingCampaignService],
  exports: [MarketingCampaignService],
})
export class MarketingCampaignModule {}
