-- Car Insurance Database Initialization Script
-- This script sets up the initial database structure and seed data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE policy_status AS ENUM ('active', 'pending', 'cancelled', 'expired', 'suspended', 'lapsed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE claim_status AS ENUM ('submitted', 'under_review', 'investigating', 'approved', 'denied', 'settled', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created by TypeORM, but we can add custom ones here if needed

-- Insert seed data for development
-- Admin user (password: Admin123!)
INSERT INTO users (
    id, 
    "firstName", 
    "lastName", 
    email, 
    password, 
    role, 
    "isEmailVerified", 
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'Admin',
    'User',
    'admin@carinsurance.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4w5.KjNjKu', -- Admin123!
    'admin',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sample agent user (password: Agent123!)
INSERT INTO users (
    id, 
    "firstName", 
    "lastName", 
    email, 
    password, 
    role, 
    "isEmailVerified", 
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'John',
    'Agent',
    'agent@carinsurance.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4w5.KjNjKu', -- Agent123!
    'agent',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sample customer user (password: Customer123!)
INSERT INTO users (
    id, 
    "firstName", 
    "lastName", 
    email, 
    password, 
    role, 
    "isEmailVerified", 
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'Jane',
    'Customer',
    'customer@carinsurance.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4w5.KjNjKu', -- Customer123!
    'customer',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
