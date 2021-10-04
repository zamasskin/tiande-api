import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import * as _ from 'lodash';

@Injectable()
export class SectionService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  async findSectionCodePathById(id: number) {
    const query = this.qb
      .withRecursive('cte', ['num', 'id', 'code', 'parent_id'], (qb) =>
        qb
          .select(
            this.qb.raw('0 as `num`'),
            'ID AS id',
            'CODE AS code',
            'IBLOCK_SECTION_ID as parent_id',
          )
          .from('b_iblock_section')
          .where('ID', id)
          .unionAll((qb) =>
            qb
              .select(
                this.qb.raw('`cte`.`num` + 1 as `num`'),
                's2.ID AS id',
                's2.CODE AS code',
                's2.IBLOCK_SECTION_ID as parent_id',
              )
              .from({ s2: 'b_iblock_section' })
              .join('cte', 's2.ID', 'cte.parent_id'),
          ),
      )
      .from('cte')
      .select(
        this.qb.raw(
          "GROUP_CONCAT(`code` ORDER BY `num` DESC SEPARATOR '/') as `path`",
        ),
      );

    const sectionPath = await this.qb(query.as('t')).first();
    return {
      id,
      path: sectionPath.path,
    };
  }

  async findSectionCodePaths(sectionId: number[]) {
    const defaultValues = sectionId.map((id) => ({ id, path: '' }));
    sectionId = sectionId.filter((id) => id);
    if (sectionId.length === 0) {
      return defaultValues;
    }
    const values = await Promise.all(
      sectionId.map((id) => this.findSectionCodePathById(id)),
    );
    return _.unionBy(values, defaultValues, 'id');
  }
}
