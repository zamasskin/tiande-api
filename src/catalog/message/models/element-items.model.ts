import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class ElementItemsModel {
  @Type(() => Number)
  @Expose({ name: 'UF_ITEM_ID' })
  id = 0;

  @Expose({ name: 'UF_NAME' })
  name = '';

  @Expose({ name: 'UF_USAGE' })
  usage = '';

  @Expose({ name: 'UF_VOICE' })
  voice = '';

  @Expose({ name: 'UF_PREVIEW_TEXT' })
  text = '';

  @Expose({ name: 'UF_DETAIL_TEXT' })
  detailText = '';

  @Expose({ name: 'UF_VOLUME' })
  volume = '';
}
