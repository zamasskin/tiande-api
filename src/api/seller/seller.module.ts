import { Module } from '@nestjs/common';
import { MarketingCampaignModule } from 'stocks/marketing-campaign/marketing-campaign.module';
import { DiscountController } from './discount.controller';
import { SellerGuard } from './seller.guard';

@Module({
  imports: [MarketingCampaignModule],
  controllers: [DiscountController],
  providers: [SellerGuard],
  exports: [SellerGuard],
})
export class SellerModule {}
