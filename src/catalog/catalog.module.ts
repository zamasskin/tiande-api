import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { PriceService } from './price/price.service';
import { CurrencyService } from './currency/currency.service';
import { MessageService } from './message/message.service';
import { ProductService } from './product/product.service';
import { ConfigurationsModule } from '../configurations/configurations.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ConfigurationsModule,
    CacheModule,
  ],
  providers: [PriceService, CurrencyService, MessageService, ProductService],
  exports: [PriceService, CurrencyService, MessageService, ProductService],
})
export class CatalogModule {}
