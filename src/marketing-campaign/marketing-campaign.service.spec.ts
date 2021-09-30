import { Test, TestingModule } from '@nestjs/testing';
import { MarketingCampaignService } from './marketing-campaign.service';

describe('MarketingCampaignService', () => {
  let service: MarketingCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketingCampaignService],
    }).compile();

    service = module.get<MarketingCampaignService>(MarketingCampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
