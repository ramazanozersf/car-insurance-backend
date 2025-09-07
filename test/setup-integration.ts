import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Integration test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_NAME = 'car_insurance_test_db';

  // Suppress console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(async () => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Test database configuration
export const getTestDatabaseConfig = () => ({
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'car_insurance_test_db',
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: true, // Only for tests
  dropSchema: true, // Clean database for each test run
  logging: false,
});

// Helper to create test module
export const createTestModule = async (
  imports: any[] = [],
  providers: any[] = [],
) => {
  const moduleBuilder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      TypeOrmModule.forRoot(getTestDatabaseConfig()),
      ...imports,
    ],
    providers,
  });

  const module: TestingModule = await moduleBuilder.compile();
  const app = module.createNestApplication();

  return { module, app };
};

// Database cleanup utility
export const cleanDatabase = async (dataSource: any) => {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
};
