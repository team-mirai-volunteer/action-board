-- BigQuery Replication Setup Migration
-- This migration sets up logical replication for BigQuery integration
-- Reference: https://tech.asahi.co.jp/posts/20250214-197e

-- 1. Create publication for all tables
CREATE PUBLICATION bq_pub FOR ALL TABLES;

-- 2. Create logical replication slot
SELECT PG_CREATE_LOGICAL_REPLICATION_SLOT('bq_slot', 'pgoutput');

-- 3. Create dedicated user for BigQuery replication
-- Note: In production/staging, password is retrieved from Supabase Vault
-- For local development, a default password is used
DO $$
DECLARE
    password TEXT;
    is_local BOOLEAN;
BEGIN
    -- Check if we're in local development (Supabase local doesn't have certain system settings)
    -- This checks for the presence of a Supabase-specific setting that only exists in cloud
    SELECT current_setting('app.settings.jwt_secret', true) IS NULL INTO is_local;
    
    IF is_local THEN
        -- Local development: use default password
        password := 'local_dev_password_123';
        RAISE WARNING 'Using default password for bq_user in local development. This should NOT be used in production!';
    ELSE
        -- Production/Staging: get password from Vault
        SELECT decrypted_secret INTO password
        FROM vault.decrypted_secrets
        WHERE name = 'bq_user_password';
        
        -- Validate password exists in production
        IF password IS NULL OR password = '' THEN
            RAISE EXCEPTION 'Secret "bq_user_password" not found in Supabase Vault.' || E'\n' ||
                            'This secret must be configured in staging/production environments.';
        END IF;
    END IF;
    
    -- Create user with the password
    EXECUTE format('CREATE USER bq_user WITH ENCRYPTED PASSWORD %L', password);
EXCEPTION
    WHEN duplicate_object THEN
        -- If user already exists, just update the password
        EXECUTE format('ALTER USER bq_user WITH ENCRYPTED PASSWORD %L', password);
END $$;

-- 4. Grant replication privilege
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
