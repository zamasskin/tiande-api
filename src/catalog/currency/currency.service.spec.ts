import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import configuration from '../../config/configuration';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [CurrencyService],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('number format', () => {
    expect(service.numberFormat(1234567890, 2, ',', ' ', false)).toEqual(
      '1 234 567 890,00',
    );
    expect(service.numberFormat(1234567890.1, 2, ',', ' ', false)).toEqual(
      '1 234 567 890,10',
    );
    expect(service.numberFormat(1234567890.1, 0, ',', ' ', false)).toEqual(
      '1 234 567 890',
    );
    expect(service.numberFormat(1234567890, 2, ',', ' ', true)).toEqual(
      '1 234 567 890',
    );
  });
});
