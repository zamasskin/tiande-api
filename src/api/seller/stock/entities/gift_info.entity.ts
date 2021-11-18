import { ApiProperty } from '@nestjs/swagger';
import { GiftInfoEntity } from 'src/stocks/gift/entities/gift-info.entity';

export class GiftInfo implements GiftInfoEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  used: boolean;

  @ApiProperty()
  dateEnd: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  priceFormat: string;
}
