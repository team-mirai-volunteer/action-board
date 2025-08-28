#!/bin/bash

# Supabase Production Deployment Script
# Usage: ./scripts/deploy-supabase.sh [production|staging]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_REF=""
CONFIG_FILE=""

case $ENVIRONMENT in
  "production")
    PROJECT_REF=$SUPABASE_PRODUCTION_PROJECT_REF
    CONFIG_FILE="supabase/config.production.toml"
    echo "🚀 Deploying to PRODUCTION environment"
    ;;
  "staging")
    PROJECT_REF=$SUPABASE_STAGING_PROJECT_REF
    CONFIG_FILE="supabase/config.toml"
    echo "🧪 Deploying to STAGING environment"
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [production|staging]"
    exit 1
    ;;
esac

if [ -z "$PROJECT_REF" ]; then
  echo "❌ Project reference not set for $ENVIRONMENT environment"
  echo "Please set SUPABASE_${ENVIRONMENT^^}_PROJECT_REF environment variable"
  exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN not set"
  exit 1
fi

echo "📋 Using configuration: $CONFIG_FILE"
echo "🔗 Project Reference: $PROJECT_REF"

# Link to the Supabase project
echo "🔗 Linking to Supabase project..."
npx supabase link --project-ref $PROJECT_REF

# Push database schema changes
echo "📤 Pushing database migrations..."
npx supabase db push --include-all

# Push configuration changes
echo "⚙️  Pushing configuration..."
if [ -f "$CONFIG_FILE" ]; then
  npx supabase config push --config $CONFIG_FILE
else
  npx supabase config push
fi

# Sync mission data
echo "📊 Syncing mission data..."
npm run mission:sync

# Generate and update types
echo "🔧 Generating TypeScript types..."
npm run types

echo "✅ Supabase deployment to $ENVIRONMENT completed successfully!"

# Optional: Run database tests
if [ "$RUN_TESTS" = "true" ]; then
  echo "🧪 Running database tests..."
  npm run test:rls
fi