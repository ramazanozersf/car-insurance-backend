import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_EXPIRATION'),
  },
});

export const getJwtRefreshConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_REFRESH_SECRET'),
  expiresIn: configService.get<string>('JWT_REFRESH_EXPIRATION'),
});
