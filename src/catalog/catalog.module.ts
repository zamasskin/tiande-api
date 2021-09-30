import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { PriceService } from './price/price.service';
import { CurrencyService } from './currency/currency.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [PriceService, CurrencyService],
  exports: [PriceService, CurrencyService],
})
export class CatalogModule {}
