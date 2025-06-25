#!/bin/bash
# Automate Supabase migration and seeding
set -e

# Run migrations
echo "Running Supabase migrations..."
supabase db push

# Seed the database
echo "Seeding database with supabase/seed.sql..."
supabase db execute < supabase/seed.sql

echo "Migration and seeding complete!"
