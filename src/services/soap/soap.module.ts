import { Module } from '@nestjs/common';
import { ClientService } from './client/client.service';
import { ClientController } from './client/client.controller';

@Module({
  providers: [ClientService],
  controllers: [ClientController]
})
export class SoapModule {}
