-- Grant bq_user SELECT on auth.users for BigQuery replication
GRANT USAGE ON SCHEMA auth TO bq_user;
GRANT SELECT ON auth.users TO bq_user;
