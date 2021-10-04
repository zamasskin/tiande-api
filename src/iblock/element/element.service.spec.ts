import { ConfigModule } from '@nestjs/config/dist';
import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from '../../configurations/site/site.service';
import configuration from '../../config/configuration';
import { SectionService } from '../section/section.service';
import { ElementService } from './element.service';

describe('ElementService', () => {
  let service: ElementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [ElementService, SiteService, SectionService],
    }).compile();

    service = module.get<ElementService>(ElementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', async () => {
    const id = 148637;
    const result = await service.findUrlsById([id]);
    expect(result).toEqual([{ id, url: '/catalog/wellness/napitki/148637/' }]);
  });
});
