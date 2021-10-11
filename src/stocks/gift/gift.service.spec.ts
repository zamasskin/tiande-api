import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import configuration from '../../config/configuration';
import { MarketingCampaignModule } from '../marketing-campaign/marketing-campaign.module';
import { GiftService } from './gift.service';

describe('GiftService', () => {
  let service: GiftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        MarketingCampaignModule,
      ],
      providers: [GiftService],
    }).compile();

    service = module.get<GiftService>(GiftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
