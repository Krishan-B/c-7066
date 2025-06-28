# Supabase Synchronization Guide

## Quick Reference Commands

### Authentication & Project Management

```bash
# Login to Supabase
supabase login

# List all projects
supabase projects list

# Link local project to remote
supabase link --project-ref YOUR_PROJECT_ID

# Check current status
supabase status
```

### Migration Management

```bash
# Show migration status (local vs remote)
supabase migration list

# Show only remote migrations
supabase migration list --linked

# Create new migration
supabase migration new migration_name

# Push local migrations to remote
supabase db push

# Push all migrations (including out-of-order ones)
supabase db push --include-all

# Pull remote schema to local
supabase db pull

# Preview what would be pushed (dry run)
supabase db push --dry-run
```

### Database Operations

```bash
# Reset local database
supabase db reset

# Dump local database
supabase db dump --local > backup.sql

# Dump remote database
supabase db dump --linked > backup.sql

# Show schema differences
supabase db diff --linked --schema public

# Apply SQL file to local database
supabase db reset --sql-file your_file.sql
```

### Functions & Policies

```bash
# Deploy functions
supabase functions deploy

# List functions
supabase functions list

# Show function logs
supabase functions logs function_name
```

## Common Synchronization Scenarios

### Scenario 1: Local is Ahead of Remote

**When to use**: You've been developing locally and need to push changes to production.

```bash
# 1. Backup both environments
supabase db dump --local > local_backup.sql
supabase db dump --linked > remote_backup.sql

# 2. Check what's different
supabase db diff --linked --schema public

# 3. Push changes to remote
supabase db push

# 4. Verify migration status
supabase migration list
```

### Scenario 2: Remote is Ahead of Local

**When to use**: Production has changes you need locally.

```bash
# 1. Backup local environment
supabase db dump --local > local_backup.sql

# 2. Pull remote changes
supabase db pull

# 3. Reset local with new schema
supabase db reset

# 4. Verify synchronization
supabase migration list
```

### Scenario 3: Migration History Conflicts

**When to use**: Migration histories have diverged and can't be reconciled.

```bash
# 1. Backup everything
mkdir backups/$(date +%Y%m%d_%H%M%S)
supabase db dump --local > backups/$(date +%Y%m%d_%H%M%S)/local.sql
supabase db dump --linked > backups/$(date +%Y%m%d_%H%M%S)/remote.sql

# 2. Generate a single migration with current differences
supabase db diff --linked --schema public > migration_sync.sql

# 3. Create new migration file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mv migration_sync.sql "supabase/migrations/${TIMESTAMP}_sync_schemas.sql"

# 4. Push the sync migration
supabase db push
```

## Troubleshooting Common Issues

### Issue 1: "relation already exists" Error

**Problem**: Trying to apply migrations that create tables/functions that already exist.

**Solution**:

```bash
# Option A: Use --include-all flag
supabase db push --include-all

# Option B: Generate diff-based migration
supabase db diff --linked --schema public > fix_conflicts.sql
# Edit the file to remove conflicting statements
# Create new migration with the edited content
```

### Issue 2: Migration History Out of Order

**Problem**: Local migrations have timestamps that are out of order with remote.

**Solution**:

```bash
# Check the order issue
supabase migration list

# Use include-all flag to apply all migrations
supabase db push --include-all

# Or rename migration files to fix order
# mv old_migration.sql new_timestamp_migration.sql
```

### Issue 3: Authentication Issues

**Problem**: Commands fail with authentication errors.

**Solution**:

```bash
# Re-authenticate
supabase logout
supabase login

# Verify authentication
supabase projects list

# Re-link project if needed
supabase link --project-ref YOUR_PROJECT_ID
```

### Issue 4: Local Supabase Not Running

**Problem**: Local development server is not running.

**Solution**:

```bash
# Start local Supabase
supabase start

# Check status
supabase status

# Stop and restart if needed
supabase stop
supabase start
```

### Issue 5: Schema Differences Not Detected

**Problem**: `supabase db diff` shows no differences when you expect some.

**Solution**:

```bash
# Specify schema explicitly
supabase db diff --linked --schema public

# Check specific schemas
supabase db diff --linked --schema auth
supabase db diff --linked --schema storage

# Include all schemas
supabase db diff --linked --schema=public,auth,storage
```

## Best Practices

### 1. Always Backup Before Sync

```bash
# Create timestamped backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup both environments
supabase db dump --local > $BACKUP_DIR/local.sql
supabase db dump --linked > $BACKUP_DIR/remote.sql
```

### 2. Use Descriptive Migration Names

```bash
# Good migration names
supabase migration new add_user_profiles_table
supabase migration new update_orders_add_status_column
supabase migration new create_trading_functions

# Avoid generic names
supabase migration new update  # Too generic
supabase migration new fix     # Not descriptive
```

### 3. Test Migrations Locally First

```bash
# Always test locally before pushing
supabase db reset              # Start fresh
supabase migration up          # Apply migrations
# Test your application
supabase db push              # Only push after testing
```

### 4. Keep Environments in Sync Regularly

```bash
# Daily sync routine
supabase migration list        # Check status
supabase db push              # Push if local is ahead
# Or set up automated deployment pipeline
```

### 5. Use Branches for Major Changes

```bash
# Create feature branch
git checkout -b feature/new-schema

# Make changes and test
supabase migration new feature_changes
# Test thoroughly

# Merge only after testing
git checkout main
git merge feature/new-schema
supabase db push
```

## Emergency Recovery Procedures

### Recover from Failed Migration

```bash
# 1. Stop local Supabase
supabase stop

# 2. Restore from backup
supabase db reset --sql-file backups/your_backup.sql

# 3. Start Supabase
supabase start

# 4. Fix the problematic migration
# Edit the migration file to fix issues

# 5. Try again
supabase db push
```

### Reset Everything and Start Fresh

```bash
# LOCAL RESET (DANGER: Loses all local data)
supabase stop
supabase db reset
supabase start

# REMOTE RESET (DANGER: Loses all remote data)
# This must be done through Supabase Dashboard:
# 1. Go to Settings > Database
# 2. Click "Reset Database"
# 3. Confirm the action
# 4. Run: supabase db push --include-all
```

## Monitoring and Validation

### Post-Sync Verification Checklist

```bash
# 1. Check migration status
supabase migration list

# 2. Verify local connectivity
supabase status

# 3. Test database queries
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT version();"

# 4. Check remote connectivity
# Test your application with remote database

# 5. Verify functions are deployed
supabase functions list

# 6. Check RLS policies
# Query auth.policies table or check in Supabase Dashboard
```

### Automated Health Check Script

```bash
#!/bin/bash
# Save as scripts/health-check.sh

echo "🏥 Supabase Health Check"
echo "======================="

# Check local status
if supabase status | grep -q "running"; then
    echo "✅ Local Supabase is running"
else
    echo "❌ Local Supabase is not running"
fi

# Check migration sync
SYNC_STATUS=$(supabase migration list | grep -c "│.*│.*│")
echo "📊 Migration entries: $SYNC_STATUS"

# Check authentication
if supabase projects list > /dev/null 2>&1; then
    echo "✅ Authentication working"
else
    echo "❌ Authentication failed"
fi

echo "🏥 Health check completed"
```

## Configuration Files

### Recommended .env.local

```bash
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# For production/staging
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_remote_anon_key
```

### Useful Git Hooks

```bash
# .git/hooks/pre-push
#!/bin/bash
# Ensure migrations are in sync before pushing code

echo "Checking Supabase migration status..."
if ! supabase migration list | grep -q "All migrations applied"; then
    echo "⚠️  Migrations not in sync. Run 'supabase db push' first."
    exit 1
fi
```

This guide should help you handle any Supabase synchronization scenario you encounter!
