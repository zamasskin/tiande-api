import { Module } from '@nestjs/common';
import { BasketModule } from './basket/basket.module';

@Module({
  imports: [BasketModule],
})
export class SaleModule {}
