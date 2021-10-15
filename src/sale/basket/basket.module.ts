import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from 'src/catalog/catalog.module';
import configuration from 'src/config/configuration';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { IblockModule } from 'src/iblock/iblock.module';
import { BasketService } from './basket.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CatalogModule,
    ConfigurationsModule,
    IblockModule,
  ],
  providers: [BasketService],
  exports: [BasketService],
})
export class BasketModule {}
