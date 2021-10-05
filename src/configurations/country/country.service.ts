import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { CacheService } from '../../cache/cache.service';
import { Cache } from '../../cache/decorators/cache-promise.decorator';
import { CountryModel } from './models/country.model';

@Injectable()
export class CountryService {
  qb: Knex;
  constructor(
    configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.qb = configService.get('knex');
  }

  @Cache<CountryModel>({ ttl: 60 * 60 })
  async findById(id: number) {
    return plainToClass(
      CountryModel,
      await this.qb('bit_country').where('ID', id).first(),
    );
  }
}
