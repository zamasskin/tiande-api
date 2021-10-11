import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { StocksModule } from 'src/stocks/stocks.module';
import { StockController } from './stock.controller';

@Module({
  imports: [
    StocksModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [StockController],
})
export class StockModule {}
