import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';

@Injectable()
export class UserService {
  qb: Knex;
  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }
  async checkAdminByUserId(userId: number) {
    const result = await this.qb('b_user_group')
      .where('USER_ID', userId)
      .where('GROUP_ID', 1)
      .first();
    return !!result;
  }
}
