import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { PriceService } from './price/price.service';
import { CurrencyService } from './currency/currency.service';
import { MessageService } from './message/message.service';
import { ProductService } from './product/product.service';
import { ConfigurationsModule } from 'src/configurations/configurations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ConfigurationsModule,
  ],
  providers: [PriceService, CurrencyService, MessageService, ProductService],
  exports: [PriceService, CurrencyService, MessageService],
})
export class CatalogModule {}
