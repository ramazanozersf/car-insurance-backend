import { execSync } from 'child_process';

export default async () => {
  console.log('🧹 Cleaning up test environment...');

  try {
    // Drop test database
    console.log('🗑️ Dropping test database...');
    execSync(`dropdb ${process.env.DATABASE_NAME} || true`, {
      stdio: 'ignore',
    });

    console.log('✅ Test environment cleanup complete');
  } catch (error) {
    console.warn('⚠️ Database cleanup warning:', error.message);
  }
};
