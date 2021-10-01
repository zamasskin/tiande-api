import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';

export class ElementModel {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id: number;

  @Expose({ name: 'NAME' })
  name: string;

  @Type(() => Number)
  @Expose({ name: 'SORT' })
  sort: number;

  @Type(() => Number)
  @Expose({ name: 'PREVIEW_PICTURE' })
  pictureId: number;

  @Type(() => Number)
  @Expose({ name: 'DETAIL_PICTURE' })
  detailPictureId: number;

  @Expose({ name: 'PREVIEW_TEXT' })
  text: string;

  @Expose({ name: 'DETAIL_TEXT' })
  detailText: string;

  @Expose({ name: 'ACTIVE' })
  _active: string;

  get active() {
    return this._active === 'Y';
  }

  @Type(() => Number)
  @Expose({ name: 'IBLOCK_ID' })
  iblockId: number;

  @Type(() => Number)
  @Expose({ name: 'IBLOCK_SECTION_ID' })
  sectionId: string;

  @Expose({ name: 'XML_ID' })
  xmlId: string;

  @Expose({ name: 'CODE' })
  code: string;
}
