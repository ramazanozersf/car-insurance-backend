import { execSync } from 'child_process';

export default async () => {
  console.log('🚀 Setting up test environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_NAME = 'car_insurance_test_db';

  try {
    // Create test database if it doesn't exist
    console.log('📊 Creating test database...');
    execSync(`createdb ${process.env.DATABASE_NAME} || true`, {
      stdio: 'ignore',
    });

    console.log('✅ Test environment setup complete');
  } catch (error) {
    console.warn('⚠️ Database setup warning:', error.message);
  }
};
