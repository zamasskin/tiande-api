import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
export class IBlockModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Expose({ name: 'DETAIL_PAGE_URL' })
  detailUrl: string;
}
