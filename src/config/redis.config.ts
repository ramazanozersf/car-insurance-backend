import { BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (configService: ConfigService): BullModuleOptions => ({
  redis: {
    host: configService.get<string>('REDIS_HOST'),
    port: configService.get<number>('REDIS_PORT'),
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
  },
});

export const getCacheConfig = (configService: ConfigService) => ({
  host: configService.get<string>('REDIS_HOST'),
  port: configService.get<number>('REDIS_PORT'),
  password: configService.get<string>('REDIS_PASSWORD') || undefined,
  ttl: 300, // 5 minutes default TTL
});
