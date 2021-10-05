import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';

@Injectable()
export class SellerGuard implements CanActivate {
  qb: Knex;
  constructor(private configService: ConfigService) {
    this.qb = configService.get('knex');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const option = await this.qb('b_option')
      .where('MODULE_ID', 'tiande.configuration')
      .where('NAME', 'api_access_seller_token')
      .select('VALUE as value')
      .first();
    console.log(option);
    const req = context.switchToHttp().getRequest();
    const raw_header = (req.header('Authorization') || '').split(' ');
    if (raw_header.length != 2) this.unauthorized(context);
    switch (raw_header[0].toLowerCase()) {
      case 'bearer': {
        const token = raw_header[1];
        return token === option.value;
        //https://github.com/m1cr0man/m1cr0blog/blob/master/src/modules/users/guard.ts
      }
    }
    return false;
  }

  protected unauthorized(context: ExecutionContext): never {
    throw new UnauthorizedException('Invalid token');
  }
}
