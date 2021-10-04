import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import configuration from '../../config/configuration';
import { SectionService } from './section.service';

describe('SectionService', () => {
  let service: SectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [SectionService],
    }).compile();

    service = module.get<SectionService>(SectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', async () => {
    const path = await service.findSectionCodePathById(4734);
    expect(path).toEqual({ id: 4734, path: 'wellness/napitki' });
  });
});
