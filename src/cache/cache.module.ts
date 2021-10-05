import { Module, CacheModule as NestCacheModule } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheConfigService } from './cache-config/cache-config.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useClass: CacheConfigService,
      inject: [CacheConfigService],
    }),
  ],
  providers: [CacheConfigService, CacheService],
  exports: [CacheService],
})
export class CacheModule {}
