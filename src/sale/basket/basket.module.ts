import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from 'src/catalog/catalog.module';
import configuration from 'src/config/configuration';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { BasketService } from './basket.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CatalogModule,
    ConfigurationsModule,
  ],
  providers: [BasketService],
  exports: [BasketService],
})
export class BasketModule {}
