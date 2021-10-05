import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { LangService } from './lang/lang.service';
import { CountryService } from './country/country.service';
import { SiteService } from './site/site.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CacheModule,
  ],
  providers: [LangService, CountryService, SiteService],
  exports: [LangService, CountryService, SiteService],
})
export class ConfigurationsModule {}
