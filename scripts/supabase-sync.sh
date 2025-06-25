#!/bin/bash
# Automate Supabase schema sync (pull and push)
set -e

SUPABASE_DB_URL="postgresql://postgres.hntsrkacolpseqnyidis:b0QZjfQhZ1WgKubX@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Pull latest schema from remote
supabase db pull --db-url "$SUPABASE_DB_URL"

# Push local migrations to remote
supabase db push --db-url "$SUPABASE_DB_URL"

echo "Supabase schema sync complete!"
