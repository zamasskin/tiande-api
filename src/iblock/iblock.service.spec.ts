import { Test, TestingModule } from '@nestjs/testing';
import { IblockService } from './iblock.service';

describe('IblockService', () => {
  let service: IblockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IblockService],
    }).compile();

    service = module.get<IblockService>(IblockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
