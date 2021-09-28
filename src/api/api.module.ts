import { Module } from '@nestjs/common';
import { SellerModule } from './seller/seller.module';

@Module({
  imports: [SellerModule],
})
export class ApiModule {}
