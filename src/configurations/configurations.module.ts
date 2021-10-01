import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { LangService } from './lang/lang.service';
import { CountryService } from './country/country.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [LangService, CountryService],
  exports: [LangService, CountryService],
})
export class ConfigurationsModule {}
