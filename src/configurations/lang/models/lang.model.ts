import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class LangModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id = 0;

  @Expose({ name: 'UF_LANG_ID' })
  code: string;
}
