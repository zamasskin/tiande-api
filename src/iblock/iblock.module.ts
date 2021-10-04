import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ElementService } from './element/element.service';
import { SectionService } from './section/section.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [ElementService, SectionService],
  exports: [ElementService, SectionService],
})
export class IblockModule {}
