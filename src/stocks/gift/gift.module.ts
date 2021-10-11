import { Module } from '@nestjs/common';
import { GiftService } from './gift.service';

@Module({
  providers: [GiftService]
})
export class GiftModule {}
