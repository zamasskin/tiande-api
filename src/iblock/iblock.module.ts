import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ElementService } from './element/element.service';
import { SectionService } from './section/section.service';
import { IblockService } from './iblock.service';
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
  providers: [IblockService, ElementService, SectionService],
  exports: [IblockService, ElementService, SectionService],
})
export class IblockModule {}
