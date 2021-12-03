import { Module } from '@nestjs/common';
import { SoapModule } from './soap/soap.module';

@Module({
  imports: [SoapModule]
})
export class ServicesModule {}
