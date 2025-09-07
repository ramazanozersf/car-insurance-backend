export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  verify: jest
    .fn()
    .mockReturnValue({ sub: 'test-user-id', email: 'test@example.com' }),
  verifyAsync: jest
    .fn()
    .mockResolvedValue({ sub: 'test-user-id', email: 'test@example.com' }),
  decode: jest
    .fn()
    .mockReturnValue({ sub: 'test-user-id', email: 'test@example.com' }),
};

export const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 5432,
      DATABASE_USERNAME: 'postgres',
      DATABASE_PASSWORD: 'password',
      DATABASE_NAME: 'car_insurance_test_db',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
    };
    return config[key];
  }),
};
