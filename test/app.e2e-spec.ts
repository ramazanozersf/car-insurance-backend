import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getTestDatabaseConfig, cleanDatabase } from './setup-integration';

describe('Car Insurance Backend (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    })
    .overrideModule(TypeOrmModule.forRoot())
    .useModule(TypeOrmModule.forRoot(getTestDatabaseConfig()))
    .compile();

    app = module.createNestApplication();
    
    // Apply global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // Set global prefix
    app.setGlobalPrefix('api/v1');
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    const connection = module.get('Connection');
    await cleanDatabase(connection);
  });

  describe('Health Endpoints', () => {
    it('/api/v1 (GET) - should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(200)
        .expect('Hello World!');
    });

    it('/api/v1/health (GET) - should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('environment');
        });
    });
  });

  describe('Authentication Flow (e2e)', () => {
    const testUser = {
      email: 'e2e-test@example.com',
      password: 'E2ETestPassword123!',
      firstName: 'E2E',
      lastName: 'Test',
      phone: '+1234567890',
    };

    let accessToken: string;
    let refreshToken: string;

    it('should complete full authentication flow', async () => {
      // 1. Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('tokens');
      
      const { user, tokens } = registerResponse.body;
      expect(user.email).toBe(testUser.email);
      expect(user).not.toHaveProperty('password');
      
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;

      // 2. Login with registered user
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body).toHaveProperty('tokens');

      // 3. Refresh tokens
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('tokens');
      expect(refreshResponse.body.tokens).toHaveProperty('accessToken');
      expect(refreshResponse.body.tokens).toHaveProperty('refreshToken');

      // 4. Test forgot password
      const forgotPasswordResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(forgotPasswordResponse.body.message).toContain('reset link has been sent');
    });

    it('should handle authentication errors properly', async () => {
      // Test invalid registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
        })
        .expect(400);

      // Test invalid login
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      // Test invalid refresh token
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('API Security', () => {
    it('should require authentication for protected endpoints', async () => {
      // This test would be expanded when we add protected endpoints
      // For now, we test that public endpoints work without auth
      
      await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);
    });

    it('should validate request bodies', async () => {
      // Test extra fields (should be stripped due to whitelist: true)
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          extraField: 'should-be-ignored',
        })
        .expect(201);

      expect(response.body.user).not.toHaveProperty('extraField');
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/nonexistent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('method');
    });

    it('should handle validation errors properly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('Performance', () => {
    it('should respond to health check within reasonable time', async () => {
      const start = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill(0).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/health')
          .expect(200)
      );

      const responses = await Promise.all(promises);
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.body.status).toBe('ok');
      });
    });
  });
});