#!/bin/bash
set -euo pipefail

# Script to assert the health of the local Supabase database.
# It checks for the existence of critical tables and verifies they are not empty.

# --- Configuration ---
# The database connection string for the local Supabase instance.
# This is typically output by `supabase start`.
DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# An array of table names that must exist in the database.
REQUIRED_TABLES=(
  "orders"
)

# An array of tables that must exist in the auth schema.
AUTH_TABLES=(
  "users"
)

# --- Health Check Functions ---

# Checks if a given command exists in the shell's path.
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Checks if a table exists in the public schema.
table_exists() {
  local table_name=$1
  psql "$DB_URL" -c "SELECT to_regclass('public.$table_name');" | grep -q "$table_name"
}

# Checks if a table exists in the auth schema.
auth_table_exists() {
  local table_name=$1
  psql "$DB_URL" -c "SELECT to_regclass('auth.$table_name');" | grep -q "$table_name"
}

# Checks if a table has at least one row.
table_has_rows() {
  local table_name=$1
  local count=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM public.$table_name;")
  return [[ "$count" -gt 0 ]]
}

# --- Main Execution ---

main() {
  echo "🚀 Starting database health check..."

  if ! command_exists psql; then
    echo "❌ Error: psql is not installed or not in your PATH. Please install PostgreSQL client tools."
    exit 1
  fi

  # Wait for the database to be ready
  echo "⏳ Waiting for database to become available..."
  local attempts=0
  local max_attempts=10
  local ready=false
  while [ $attempts -lt $max_attempts ]; do
    if psql "$DB_URL" -c "SELECT 1" >/dev/null 2>&1; then
      ready=true
      break
    fi
    attempts=$((attempts + 1))
    sleep 2
  done

  if [ "$ready" = false ]; then
    echo "❌ Error: Database is not available after $max_attempts attempts."
    exit 1
  fi
  echo "✅ Database is available."

  # Check for required tables in public schema
  for table in "${REQUIRED_TABLES[@]}"; do
    echo "🔎 Checking for table: 'public.$table'..."
    if ! table_exists "$table"; then
      echo "❌ Error: Required table 'public.$table' does not exist."
      exit 1
    fi
    echo "✅ Table 'public.$table' exists."

    # Check if the table is seeded with data
    echo "🔎 Verifying 'public.$table' is not empty..."
    if ! table_has_rows "$table"; then
      echo "⚠️ Warning: Table 'public.$table' exists but is empty. Seeding might have failed."
      # Depending on requirements, you might want to exit 1 here.
    else
      echo "✅ Table 'public.$table' contains data."
    fi
  done

  # Check for required tables in auth schema
  for table in "${AUTH_TABLES[@]}"; do
    echo "🔎 Checking for table: 'auth.$table'..."
    if ! auth_table_exists "$table"; then
      echo "❌ Error: Required table 'auth.$table' does not exist."
      exit 1
    fi
    echo "✅ Table 'auth.$table' exists."
  done

  echo "🎉 Database health check passed successfully!"
  exit 0
}

main
