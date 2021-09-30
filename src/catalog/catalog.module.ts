import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { PriceService } from './price/price.service';
import { CurrencyService } from './currency/currency.service';
import { MessageService } from './message/message.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [PriceService, CurrencyService, MessageService],
  exports: [PriceService, CurrencyService, MessageService],
})
export class CatalogModule {}
