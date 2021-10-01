import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { LangModel } from './models/lang.model';

@Injectable()
export class LangService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  async findById(id: number) {
    return plainToClass(
      LangModel,
      await this.qb('bit_lang').where('ID', id).first(),
    );
  }
}
