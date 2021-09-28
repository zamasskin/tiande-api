import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { MarketingCampaignModule } from './marketing-campaign/marketing-campaign.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ApiModule,
    MarketingCampaignModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
