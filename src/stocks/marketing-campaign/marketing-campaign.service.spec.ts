import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogModule } from '../../catalog/catalog.module';
import configuration from '../../config/configuration';
import { ConfigurationsModule } from '../../configurations/configurations.module';
import { IblockModule } from '../../iblock/iblock.module';
import { MarketingCampaignParamsDto } from './dto/marketing-campaign-params.dto';
import { MarketingCampaignService } from './marketing-campaign.service';

describe('MarketingCampaignService', () => {
  let service: MarketingCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        CatalogModule,
        IblockModule,
        ConfigurationsModule,
      ],
      providers: [MarketingCampaignService],
    }).compile();

    service = module.get<MarketingCampaignService>(MarketingCampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find by id', async () => {
    const result = await service.findProducts(
      new MarketingCampaignParamsDto(),
      [147195, 143695, 149169],
    );
    expect(result).toBe(1);
  });
});
