import { ApiProperty } from '@nestjs/swagger';
import { StockProductEntity } from 'src/stocks/entities/stock-product.entity';

export class StockProduct implements StockProductEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  pictureId: number;

  @ApiProperty()
  detailPictureId: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  detailText: string;

  @ApiProperty()
  sectionId: number;

  @ApiProperty()
  sort: number;

  @ApiProperty()
  xmlId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  priceFormat: string;

  @ApiProperty()
  priceBal: number;

  @ApiProperty()
  priceBalFormat: string;

  @ApiProperty()
  article: string;

  @ApiProperty()
  skItemVal: string;
}
