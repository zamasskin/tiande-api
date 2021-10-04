import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import _ from 'lodash';
import { SiteService } from 'src/configurations/site/site.service';
import { SectionService } from '../section/section.service';
import { ElementModel } from './models/element.model';

type ReturnUrl = Promise<(id: number) => string>;

@Injectable()
export class ElementService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private sectionService: SectionService,
    private siteService: SiteService,
  ) {
    this.qb = configService.get('knex');
  }

  async findElementsRawById(id: number[]) {
    return plainToClass<ElementModel, Object[]>(
      ElementModel,
      await this.qb('b_iblock_element').whereIn('ID', id),
    );
  }

  async findSectionCodePathsById(id: number[]): ReturnUrl {
    const elements = await this.findElementsRawById(id);
    const sectionId = elements
      .filter((e) => e.sectionId)
      .map((e) => e.sectionId);
    if (sectionId.length === 0) {
      return () => '';
    }
    const paths = await this.sectionService.findSectionCodePaths(sectionId);
    return (id: number) => {
      const element = elements.find((e) => e.id === id);
      const path = paths.find((p) => p.id === element.sectionId);
      return path?.path || '';
    };
  }

  async findCodePathsById(id: number[]): ReturnUrl {
    const elements = await this.findElementsRawById(id);
    return (id: number) => {
      const element = elements.find((e) => e.id === id);
      return element?.code || '';
    };
  }

  async findIdPathsById(): ReturnUrl {
    return (id: number) => String(id);
  }

  async findSiteDirPaths(): ReturnUrl {
    const path = await this.siteService.findSiteDir();
    return () => path;
  }

  findPathBuilderConfig(id: number[]) {
    return {
      '#SITE_DIR#': this.findSiteDirPaths(),
      '#SECTION_CODE_PATH#': this.findSectionCodePathsById(id),
      '#ID#': this.findIdPathsById(),
      '#CODE#': this.findCodePathsById(id),
    };
  }

  async findTemplateById(id: number[]): Promise<{ id: number; url: string }[]> {
    const iblockTemplates = await this.qb({ e: 'b_iblock_element' })
      .leftJoin({ ib: 'b_iblock' }, 'id.ID', 'e.IBLOCK_ID')
      .whereIn('e.ID', id)
      .select('e.ID as id', 'ib.DETAIL_PAGE_URL as url');
    return iblockTemplates.map(({ id, url }) => ({ id: Number(id), url }));
  }
}
