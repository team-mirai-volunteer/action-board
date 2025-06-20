-- BigQuery Replication Setup Migration
-- This migration sets up logical replication for BigQuery integration
-- Reference: https://tech.asahi.co.jp/posts/20250214-197e

-- 1. Create publication for all tables
CREATE PUBLICATION bq_pub FOR ALL TABLES;

-- 2. Create logical replication slot
SELECT PG_CREATE_LOGICAL_REPLICATION_SLOT('bq_slot', 'pgoutput');

-- 3. Create dedicated user for BigQuery replication
-- Note: Requires BQ_USER_PASSWORD to be set in Supabase dashboard under Settings > Database > Database Settings
-- Or passed as environment variable when running migration
DO $$
DECLARE
    password TEXT;
BEGIN
    -- Try to get password from current_setting
    -- The 'true' parameter means it returns NULL instead of erroring if not found
    password := current_setting('app.settings.bq_user_password', true);
    
    -- If not found in app.settings, try without prefix (for direct psql execution)
    IF password IS NULL THEN
        password := current_setting('bq_user_password', true);
    END IF;
    
    -- Validate password exists
    IF password IS NULL OR password = '' THEN
        RAISE EXCEPTION 'BQ_USER_PASSWORD must be set. Either:' || E'\n' ||
                        '1. Set in Supabase dashboard: Settings > Database > Database Settings > app.settings.bq_user_password' || E'\n' ||
                        '2. Pass via psql: psql $DATABASE_URL -v bq_user_password="your-password" -f this_migration.sql';
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
