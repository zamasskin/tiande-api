import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { IBlockModel } from './iblock.model';

@Injectable()
export class IblockService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  async findById(id: string) {
    return await plainToClass(
      IBlockModel,
      await this.qb('b_iblock').where('ID', id).first(),
    );
  }
}
