import 'reflect-metadata';
import { Expose, Type, Transform } from 'class-transformer';
import { Default } from 'src/decorators.ts/class-transform.decorators';

export class CurrencyLangModel {
  @Type(() => Number)
  @Expose({ name: 'DECIMALS' })
  @Default(2)
  decimals: number;

  @Expose({ name: 'DEC_POINT' })
  @Default('.')
  decPoint: string;

  @Expose({ name: 'THOUSANDS_SEP' })
  @Default(' ')
  thousandsSep: string;

  @Expose({ name: 'HIDE_ZERO' })
  _hideZero: string;

  @Expose({ name: 'FORMAT_STRING' })
  @Default('#')
  formatString: string;

  get hideZero() {
    return this._hideZero === 'Y';
  }
}
