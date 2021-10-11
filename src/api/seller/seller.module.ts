import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { SellerGuard } from './seller.guard';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    StockModule,
  ],
  providers: [SellerGuard],
  exports: [SellerGuard],
})
export class SellerModule {}
