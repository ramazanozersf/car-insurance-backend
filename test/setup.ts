import 'reflect-metadata';

// Global test setup for unit tests
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'customer',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  createMockVehicle: () => ({
    id: 'test-vehicle-id',
    vin: 'TEST123456789VIN',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    ownerId: 'test-user-id',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  createMockQuote: () => ({
    id: 'test-quote-id',
    quoteNumber: 'Q-TEST-001',
    basePremium: 1000,
    totalPremium: 1200,
    discountAmount: 0,
    discountPercentage: 0,
    paymentFrequency: 'monthly',
    monthlyPremium: 100,
    effectiveDate: new Date(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    quoteExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'pending',
    customerId: 'test-user-id',
    vehicleId: 'test-vehicle-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
      toBeValidPhoneNumber(): R;
    }
  }

  var testUtils: {
    createMockUser: () => any;
    createMockVehicle: () => any;
    createMockQuote: () => any;
  };
}

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidPhoneNumber(received: string) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const pass = phoneRegex.test(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid phone number`,
        pass: false,
      };
    }
  },
});
