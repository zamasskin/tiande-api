import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class ElementUrlModel {
  @Expose()
  @Type(() => Number)
  id: number;

  @Expose()
  url: string;
}
