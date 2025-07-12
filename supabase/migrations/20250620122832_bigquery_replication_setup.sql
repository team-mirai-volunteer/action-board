-- BigQuery Replication Setup Migration
-- This migration sets up logical replication for BigQuery integration
-- Reference: https://tech.asahi.co.jp/posts/20250214-197e

-- need to break the transaction to avoid transaction limitations
BEGIN;  -- begin transaction
-- 1. Create publication for all tables (idempotent)
DO $$
BEGIN  -- begin code block 
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'bq_pub') THEN
        CREATE PUBLICATION bq_pub FOR ALL TABLES;
    END IF;
END $$;  -- end code block
COMMIT;  -- end transaction

BEGIN;
-- 2. Create logical replication slot (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_replication_slots WHERE slot_name = 'bq_slot') THEN
        PERFORM pg_create_logical_replication_slot('bq_slot', 'pgoutput');
    END IF;
END $$;
COMMIT;


-- 3. Create dedicated user for BigQuery replication
-- Note: Requires 'bq_user_password' secret to be created in Supabase Vault
-- To create the secret: INSERT INTO vault.secrets (name, secret) VALUES ('bq_user_password', 'your-secure-password');
DO $$
DECLARE
    password TEXT;
    vault_exists BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'vault' AND table_name = 'decrypted_secrets'
    ) INTO vault_exists;
    
    IF vault_exists THEN
        -- Get password from Supabase Vault
        SELECT decrypted_secret INTO password
        FROM vault.decrypted_secrets
        WHERE name = 'bq_user_password';
        
        -- Validate password exists
        IF password IS NULL OR password = '' THEN
            RAISE NOTICE 'Secret "bq_user_password" not found in Supabase Vault. Skipping BigQuery user creation.';
            RETURN;
        END IF;
        
        -- Create user with the password
        EXECUTE format('CREATE USER bq_user WITH ENCRYPTED PASSWORD %L', password);
    ELSE
        RAISE NOTICE 'Vault not available (CI/local environment). Skipping BigQuery user creation.';
        RETURN;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- If user already exists, just update the password
        IF vault_exists AND password IS NOT NULL THEN
            EXECUTE format('ALTER USER bq_user WITH ENCRYPTED PASSWORD %L', password);
        END IF;
END $$;

-- 4. Grant replication privilege (only if user exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bq_user') THEN
        ALTER ROLE bq_user WITH REPLICATION;
        
        -- 5. Grant SELECT privileges on all tables in public schema
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO bq_user;
        
        -- 6. Grant USAGE on public schema
        GRANT USAGE ON SCHEMA public TO bq_user;
        
        -- 7. Set default privileges for future tables
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT ON TABLES TO bq_user;
        
        -- 8. Allow user to bypass RLS (Row Level Security)
        ALTER USER bq_user BYPASSRLS;
        
        RAISE NOTICE 'BigQuery user privileges configured successfully.';
    ELSE
        RAISE NOTICE 'BigQuery user does not exist. Skipping privilege configuration.';
    END IF;
END $$;

-- Verification queries (commented out - run manually to verify):
/*
-- Check publication
SELECT pubname, puballtables, pubowner
FROM pg_publication
WHERE pubname = 'bq_pub';

-- Check replication slot
SELECT * FROM pg_replication_slots
WHERE slot_name = 'bq_slot';

-- Check slot's WAL retention size
SELECT
    slot_name,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) as retained_wal_size,
    active
FROM pg_replication_slots
WHERE slot_name = 'bq_slot';

-- Check user exists
SELECT usename FROM pg_user
WHERE usename = 'bq_user';

-- Check user privileges
SELECT rolname, rolsuper, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls
FROM pg_roles
WHERE rolname = 'bq_user';

-- Check table privileges
SELECT table_schema, table_name, privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'bq_user'
AND table_schema = 'public';

-- Check schema privileges
SELECT nspname, nspacl
FROM pg_namespace
WHERE nspname = 'public';

-- Check default privileges
SELECT
    nspname,
    defaclobjtype,
    defaclacl
FROM pg_default_acl a
JOIN pg_namespace n ON a.defaclnamespace = n.oid
WHERE nspname = 'public';
*/
