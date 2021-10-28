import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class CurrencyLangModel {
  @Type(() => Number)
  @Expose({ name: 'DECIMALS' })
  decimals = 2;

  @Expose({ name: 'DEC_POINT' })
  decPoint = '.';

  @Expose({ name: 'THOUSANDS_SEP' })
  thousandsSep = ' ';

  @Expose({ name: 'HIDE_ZERO' })
  _hideZero: string;

  @Expose({ name: 'FORMAT_STRING' })
  formatString = '#';

  get hideZero() {
    return this._hideZero === 'Y';
  }
}
