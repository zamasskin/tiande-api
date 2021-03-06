import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import * as _ from 'lodash';
import { Cache } from '../../cache/decorators/cache-promise.decorator';
import { CacheService } from '../../cache/cache.service';
import { SiteService } from '../../configurations/site/site.service';
import { SectionService } from '../section/section.service';
import { ElementModel } from './models/element.model';
import { ElementUrlModel } from './models/element-url.model';

type ReturnUrl = Promise<(id: number) => string>;

@Injectable()
export class ElementService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private sectionService: SectionService,
    private siteService: SiteService,
    private cacheService: CacheService,
  ) {
    this.qb = configService.get('knex');
  }

  @Cache<ElementModel[]>({ ttl: 60 * 60 })
  async findElementsRawById(id: number[]): Promise<ElementModel[]> {
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
      .leftJoin({ ib: 'b_iblock' }, 'ib.ID', 'e.IBLOCK_ID')
      .whereIn('e.ID', id)
      .select('e.ID as id', 'ib.DETAIL_PAGE_URL as url');
    return iblockTemplates.map(({ id, url }) => ({ id: Number(id), url }));
  }

  @Cache<ElementUrlModel[]>({ ttl: 60 * 60 })
  async findUrlsById(elementId: number[]): Promise<ElementUrlModel[]> {
    const iblockUrls = await this.findTemplateById(elementId);
    const builderConf = this.findPathBuilderConfig(elementId);
    const regExp = new RegExp(
      Object.keys(builderConf)
        .map((k) => `(` + k + ')')
        .join('|'),
      'g',
    );
    const templates = iblockUrls.map((t) => ({
      ...t,
      keys: t.url.match(regExp),
    }));
    const keys: string[] = _.chain(templates.map((t) => t.keys))
      .flattenDeep()
      .uniq()
      .value();

    const promises = keys.map(async (key) => ({
      key,
      build: await builderConf[key],
    }));
    const builders = _.keyBy(await Promise.all(promises), 'key');

    const result = elementId.map((id) => {
      const template = templates.find((t) => t.id === id);
      if (!template) {
        return { id, url: '' };
      }
      let url = template.url || '';
      template.keys.forEach(
        (key) => (url = url.replace(key, builders[key].build(id))),
      );
      return { id, url };
    });
    return plainToClass(ElementUrlModel, result);
  }

  async findUrlById(elementId: number) {
    const [{ url }] = await this.findUrlsById([elementId]);
    return url;
  }
}
