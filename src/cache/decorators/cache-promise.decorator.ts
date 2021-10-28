import { CacheService } from '../cache.service';
import {
  CacheManagerOptions,
  InternalServerErrorException,
} from '@nestjs/common';
import 'reflect-metadata';

type Cacheable<T> = (...args) => Promise<T>;
const cachePrefix = '_back_api';

export function Cache<T>(options?: CacheManagerOptions) {
  return (
    target: any,
    methodName: string,
    descriptor: TypedPropertyDescriptor<Cacheable<T>>,
  ) => {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    descriptor.value = async function (...args) {
      const cache = this.cacheService;
      if (!cache || !(cache instanceof CacheService)) {
        throw new InternalServerErrorException(
          'Target Class should inject CacheService',
        );
      } else {
        const cacheKey = `${cachePrefix}:${className}:${methodName}:${args
          .map((a) => JSON.stringify(a))
          .join()}`;

        try {
          const cacheData = await cache.get<T>(cacheKey);
          if (cacheData) {
            return cacheData;
          }

          const methodResult = await originalMethod.apply(this, args);
          cache.set<T>(cacheKey, methodResult, options);
          return methodResult;
        } catch (e) {
          throw e;
        }
      }
    };

    return descriptor;
  };
}

export function CacheBuster<T>(cacheKey: string) {
  return (
    target: any,
    methodName: string,
    descriptor: TypedPropertyDescriptor<Cacheable<T>>,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const methodResult = await originalMethod.apply(this, args);
      this.cacheService.del(cacheKey);
      return methodResult;
    };
    return descriptor;
  };
}
