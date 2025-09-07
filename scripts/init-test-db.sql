-- Car Insurance Backend Test Database Initialization
-- This script sets up the test database with proper permissions and extensions

-- Create test database if it doesn't exist
SELECT 'CREATE DATABASE car_insurance_test_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'car_insurance_test_db')\gexec

-- Connect to the test database
\c car_insurance_test_db;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create test user with limited permissions (security best practice)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'test_user') THEN
        CREATE ROLE test_user WITH LOGIN PASSWORD 'test_password';
    END IF;
END
$$;

-- Grant necessary permissions to test user
GRANT CONNECT ON DATABASE car_insurance_test_db TO test_user;
GRANT USAGE ON SCHEMA public TO test_user;
GRANT CREATE ON SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO test_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO test_user;

-- Create a test data cleanup function
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS void AS $$
DECLARE
    table_name text;
BEGIN
    -- Disable foreign key checks temporarily
    SET session_replication_role = replica;
    
    -- Truncate all tables except system tables
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name) || ' CASCADE';
    END LOOP;
    
    -- Re-enable foreign key checks
    SET session_replication_role = DEFAULT;
    
    RAISE NOTICE 'Test data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Create a function to reset sequences
CREATE OR REPLACE FUNCTION reset_sequences()
RETURNS void AS $$
DECLARE
    seq_name text;
BEGIN
    FOR seq_name IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq_name) || ' RESTART WITH 1';
    END LOOP;
    
    RAISE NOTICE 'Sequences reset completed';
END;
$$ LANGUAGE plpgsql;

-- Create a comprehensive test cleanup function
CREATE OR REPLACE FUNCTION full_test_cleanup()
RETURNS void AS $$
BEGIN
    PERFORM cleanup_test_data();
    PERFORM reset_sequences();
    RAISE NOTICE 'Full test cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization (skip if extension not available)
-- INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Display initialization success message
DO $$
BEGIN
    RAISE NOTICE '✅ Car Insurance Test Database initialized successfully';
    RAISE NOTICE '📊 Database: car_insurance_test_db';
    RAISE NOTICE '👤 Test user: test_user';
    RAISE NOTICE '🧹 Cleanup functions: cleanup_test_data(), reset_sequences(), full_test_cleanup()';
END
$$;
