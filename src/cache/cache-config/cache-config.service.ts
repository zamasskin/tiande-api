import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  /**
   * Example retry strategy for when redis is used for the cache
   * This example is only compatible with cache-manager-redis-store because it used node_redis
   */
  retryStrategy() {
    return {
      retry_strategy: (options: any) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 2) {
          return new Error('Max attempts exhausted');
        }
        return Math.min(options.attempt * 100, 3000);
      },
    };
  }

  createCacheOptions(): CacheModuleOptions {
    return {
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 60, // seconds
      max: 10, // maximum number of items in cache
    };
  }
}
