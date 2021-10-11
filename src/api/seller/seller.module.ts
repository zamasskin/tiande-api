import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { StocksModule } from 'src/stocks/stocks.module';
import { DiscountController } from './discount.controller';
import { SellerGuard } from './seller.guard';

@Module({
  imports: [
    StocksModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [DiscountController],
  providers: [SellerGuard],
  exports: [SellerGuard],
})
export class SellerModule {}
