import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class TestHelpers {
  constructor(private app: INestApplication) {}

  /**
   * Register a test user and return the response
   */
  async registerUser(userData: any) {
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userData);
  }

  /**
   * Login a user and return tokens
   */
  async loginUser(email: string, password: string) {
    const response = await request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });
    
    return response.body.tokens;
  }

  /**
   * Create an authenticated request with JWT token
   */
  authenticatedRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, token: string) {
    return request(this.app.getHttpServer())
      [method](url)
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * Create a test user with default values
   */
  createTestUserData(overrides: any = {}) {
    return {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      ...overrides,
    };
  }

  /**
   * Wait for a specified amount of time
   */
  async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a unique email for testing
   */
  generateUniqueEmail(prefix = 'test') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}@example.com`;
  }

  /**
   * Generate test VIN number
   */
  generateTestVIN() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let vin = '';
    for (let i = 0; i < 17; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  }

  /**
   * Create test vehicle data
   */
  createTestVehicleData(overrides: any = {}) {
    return {
      vin: this.generateTestVIN(),
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Blue',
      ...overrides,
    };
  }

  /**
   * Create test quote data
   */
  createTestQuoteData(overrides: any = {}) {
    return {
      basePremium: 1000,
      totalPremium: 1200,
      paymentFrequency: 'monthly',
      monthlyPremium: 100,
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      coverageDetails: {
        liability: { limit: 100000, deductible: 500 },
        collision: { limit: 50000, deductible: 1000 },
      },
      ...overrides,
    };
  }
}

/**
 * Database test utilities
 */
export class DatabaseTestUtils {
  /**
   * Truncate all tables in the test database
   */
  static async truncateAllTables(connection: any) {
    const entities = connection.entityMetadatas;
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const entity of entities) {
      const repository = connection.getRepository(entity.name);
      await repository.clear();
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  /**
   * Seed test data
   */
  static async seedTestData(connection: any) {
    // This can be expanded to seed common test data
    // For now, it's just a placeholder
  }
}

/**
 * Mock data generators
 */
export class MockDataGenerator {
  static generateUser(overrides: any = {}) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static generateVehicle(overrides: any = {}) {
    return {
      id: 'test-vehicle-id',
      vin: 'TEST123456789VIN01',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      ownerId: 'test-user-id',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static generateQuote(overrides: any = {}) {
    return {
      id: 'test-quote-id',
      quoteNumber: 'Q-TEST-001',
      basePremium: 1000,
      totalPremium: 1200,
      paymentFrequency: 'monthly',
      monthlyPremium: 100,
      status: 'pending',
      customerId: 'test-user-id',
      vehicleId: 'test-vehicle-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
