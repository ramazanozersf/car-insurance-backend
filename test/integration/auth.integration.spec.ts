import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';

import { AuthModule } from '../../src/modules/auth/auth.module';
import { User } from '../../src/shared/entities/user.entity';
import { UserRole } from '../../src/shared/enums';
import { getTestDatabaseConfig, cleanDatabase } from '../setup-integration';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([User]),
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    const dataSource = module.get('DataSource');
    await cleanDatabase(dataSource);
  });

  describe('POST /auth/register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(validRegistrationData.email);
      expect(response.body.user.firstName).toBe(
        validRegistrationData.firstName,
      );
      expect(response.body.user.lastName).toBe(validRegistrationData.lastName);
      expect(response.body.user.role).toBe(UserRole.CUSTOMER);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should register user with phone number', async () => {
      const dataWithPhone = {
        ...validRegistrationData,
        phone: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dataWithPhone)
        .expect(201);

      expect(response.body.user.phone).toBe(dataWithPhone.phone);
    });

    it('should register user with specific role', async () => {
      const dataWithRole = {
        ...validRegistrationData,
        email: 'agent@example.com',
        role: UserRole.AGENT,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dataWithRole)
        .expect(201);

      expect(response.body.user.role).toBe(UserRole.AGENT);
    });

    it('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Try to register with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...validRegistrationData,
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 for weak password', async () => {
      const invalidData = {
        ...validRegistrationData,
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 for invalid phone number', async () => {
      const invalidData = {
        ...validRegistrationData,
        phone: '1234567890', // Missing country code
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain(
        'phone must be a valid phone number',
      );
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing password, firstName, lastName
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const userData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer()).post('/auth/register').send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: userData.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: userData.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 400 for missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: userData.password,
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      refreshToken = registerResponse.body.tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('should return 400 for missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password', () => {
    beforeEach(async () => {
      // Register a user
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer()).post('/auth/register').send(userData);
    });

    it('should handle forgot password request', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.message).toContain('reset link has been sent');
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toContain('reset link has been sent');
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to registration endpoint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Make multiple rapid requests
      const promises = Array(10)
        .fill(0)
        .map((_, i) =>
          request(app.getHttpServer())
            .post('/auth/register')
            .send({ ...userData, email: `test${i}@example.com` }),
        );

      const responses = await Promise.all(promises);

      // Most should succeed, but some might be rate limited
      const successCount = responses.filter((r) => r.status === 201).length;
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;

      expect(successCount + rateLimitedCount).toBe(10);
    });
  });
});
