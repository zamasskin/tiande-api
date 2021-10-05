import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { Cache } from '../../cache/decorators/cache-promise.decorator';
import { CacheService } from '../../cache/cache.service';
import { LangModel } from './models/lang.model';

@Injectable()
export class LangService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.qb = configService.get('knex');
  }

  @Cache<LangModel>({ ttl: 60 * 60 })
  async findById(id: number) {
    return plainToClass(
      LangModel,
      await this.qb('bit_lang').where('ID', id).first(),
    );
  }
}
