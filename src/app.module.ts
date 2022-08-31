import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { CatalogModule } from './catalog/catalog.module';
import { IblockModule } from './iblock/iblock.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { CacheModule } from './cache/cache.module';
import { StocksModule } from './stocks/stocks.module';
import { SaleModule } from './sale/sale.module';
import { MainModule } from './main/main.module';
import { ServicesModule } from './services/services.module';
import configuration from './config/configuration';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CatalogModule,
    IblockModule,
    ConfigurationsModule,
    CacheModule,
    StocksModule,
    SaleModule,
    MainModule,
    ServicesModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
