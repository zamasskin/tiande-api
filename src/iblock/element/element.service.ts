import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { SectionService } from '../section/section.service';
import { ElementModel } from './models/element.model';

@Injectable()
export class ElementService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private sectionService: SectionService,
  ) {
    this.qb = configService.get('knex');
  }

  async findElementsRawById(id: number[]) {
    return plainToClass<ElementModel, Object[]>(
      ElementModel,
      await this.qb('b_iblock_element').whereIn('ID', id),
    );
  }

  async findSectionCodePathsById(id: number[]): Promise<(number) => string> {
    const elements = await this.findElementsRawById(id);
    const sectionId = elements
      .filter((e) => e.sectionId)
      .map((e) => e.sectionId);
    if (sectionId.length === 0) {
      return () => '';
    }
    const paths = await this.sectionService.findSectionCodePaths(sectionId);
    return (id: number) => {
      const path = paths.find((p) => p.id === id);
      return path?.path || '';
    };
  }

  async asyncCodePathsById(id: number[]) {
    const elements = await this.findElementsRawById(id);
    return (id: number) => {
      const element = elements.find((e) => e.id === id);
      return element?.code || '';
    };
  }
}
