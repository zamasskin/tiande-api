import { Module } from '@nestjs/common';
import { ClientService } from './client/client.service';

@Module({
  providers: [ClientService]
})
export class SoapModule {}
