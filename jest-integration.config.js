module.exports = {
  // Configuration for integration tests
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Test file patterns for integration tests
  testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
  
  // Transform configuration
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  
  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup-integration.ts'],
  
  // Test timeout (longer for integration tests)
  testTimeout: 30000,
  
  // Run tests serially for database operations
  maxWorkers: 1,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
};
