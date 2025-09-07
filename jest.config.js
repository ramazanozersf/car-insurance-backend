module.exports = {
  // Base configuration for unit tests
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Test file patterns
  testRegex: '.*\\.spec\\.ts$',
  
  // Transform configuration
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.dto.ts',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  
  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
};
