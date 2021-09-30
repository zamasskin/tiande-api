import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class PropertiesModel {
  @Type(() => Number)
  @Expose({ name: 'IBLOCK_ELEMENT_ID' })
  id: number;

  @Expose({ name: 'PROPERTY_542' })
  article: string;

  @Expose({ name: 'PROPERTY_567' })
  skItemVal: string;

  get isSet() {
    const setId = [
      'c65fe453-e8fc-11e4-81eb-c53dde4ed71b',
      '37243fe8-e35a-11e4-81eb-c53dde4ed71b',
    ];
    return setId.includes(this.itemType);
  }

  @Expose({ name: 'PROPERTY_550' })
  private itemType: string;
}
