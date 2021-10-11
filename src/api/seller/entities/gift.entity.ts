import { ApiProperty } from '@nestjs/swagger';
import { GiftEntity } from 'src/stocks/gift/entities/gift.entity';
import { GiftInfo } from './gift_info.entity';
import { StockProduct } from './stock_product.entity';

export class Gift extends StockProduct implements GiftEntity {
  @ApiProperty()
  giftInfo: GiftInfo;
}
