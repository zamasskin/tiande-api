import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export class SellerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const raw_header = (req.header('Authorization') || '').split(' ');
    if (raw_header.length != 2) this.unauthorized(context);
    switch (raw_header[0].toLowerCase()) {
      case 'bearer': {
        const token = raw_header[1];
        return token === '12345';
        //https://github.com/m1cr0man/m1cr0blog/blob/master/src/modules/users/guard.ts
      }
    }
    return false;
  }

  protected unauthorized(context: ExecutionContext): never {
    throw new UnauthorizedException('Invalid token');
  }
}
