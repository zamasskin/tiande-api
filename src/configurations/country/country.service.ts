import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Knex } from 'knex';
import { CountryModel } from './models/country.model';

@Injectable()
export class CountryService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  async findById(id: number) {
    return plainToClass(
      CountryModel,
      await this.qb('bit_country').where('ID', id).first(),
    );
  }
}
