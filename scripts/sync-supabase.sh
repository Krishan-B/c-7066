#!/bin/bash

# Supabase Local-Remote Synchronization Script
# This script ensures complete synchronization between local and remote Supabase environments

set -e  # Exit on any error

echo "🚀 Starting Supabase Local-Remote Synchronization..."
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    print_error "supabase/config.toml not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Verify Authentication
print_status "Step 1: Verifying Supabase authentication..."
if ! supabase projects list > /dev/null 2>&1; then
    print_error "Not authenticated with Supabase. Please run 'supabase login' first."
    exit 1
fi
print_success "Authentication verified"

# Step 2: Check current status
print_status "Step 2: Checking current project status..."
supabase status
echo ""

# Step 3: Show current migration status
print_status "Step 3: Showing migration status..."
echo "Current migration status:"
supabase migration list
echo ""

# Step 4: Create timestamped backup directory
BACKUP_DIR="backups/sync_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_status "Step 4: Creating backups in $BACKUP_DIR..."

# Backup local database
print_status "Backing up local database..."
supabase db dump --local > "$BACKUP_DIR/local_backup.sql"
print_success "Local backup created: $BACKUP_DIR/local_backup.sql"

# Backup remote database
print_status "Backing up remote database..."
supabase db dump --linked > "$BACKUP_DIR/remote_backup.sql"
print_success "Remote backup created: $BACKUP_DIR/remote_backup.sql"

# Step 5: Show options for synchronization
echo ""
print_status "Step 5: Synchronization Options"
echo "================================================"
echo "Choose your synchronization strategy:"
echo ""
echo "1. Push Local to Remote (Local is source of truth)"
echo "   - This will make remote match local exactly"
echo "   - Use if your local development is ahead"
echo ""
echo "2. Pull Remote to Local (Remote is source of truth)"
echo "   - This will make local match remote exactly"
echo "   - Use if remote has changes you want locally"
echo ""
echo "3. Reset Remote and Push All (Clean slate approach)"
echo "   - This will reset remote migration history and push all local migrations"
echo "   - Use when migration histories are too complex to reconcile"
echo ""
echo "4. Manual Review (Exit and review differences manually)"
echo "   - Exit script to manually review differences"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Option 1: Pushing local changes to remote..."
        
        # Generate diff and apply
        print_status "Generating schema differences..."
        supabase db diff --linked --schema public > "$BACKUP_DIR/schema_diff.sql"
        
        if [ -s "$BACKUP_DIR/schema_diff.sql" ]; then
            print_status "Schema differences found. Applying to remote..."
            echo "Preview of changes:"
            head -20 "$BACKUP_DIR/schema_diff.sql"
            echo ""
            read -p "Do you want to apply these changes to remote? (y/N): " confirm
            
            if [[ $confirm =~ ^[Yy]$ ]]; then
                # Create a new migration with the diff
                MIGRATION_NAME="sync_local_to_remote_$(date +%Y%m%d_%H%M%S)"
                cp "$BACKUP_DIR/schema_diff.sql" "supabase/migrations/${MIGRATION_NAME}.sql"
                
                # Push the migration
                supabase db push
                print_success "Local changes pushed to remote"
            else
                print_warning "Synchronization cancelled by user"
            fi
        else
            print_success "No schema differences found. Databases are in sync!"
        fi
        ;;
        
    2)
        print_status "Option 2: Pulling remote changes to local..."
        
        print_warning "This will reset your local database to match remote!"
        read -p "Are you sure you want to continue? This will lose local-only changes! (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            # Reset local database
            supabase db reset
            
            # Pull remote schema
            supabase db pull
            
            print_success "Local database synchronized with remote"
        else
            print_warning "Synchronization cancelled by user"
        fi
        ;;
        
    3)
        print_status "Option 3: Reset remote and push all local migrations..."
        
        print_warning "This will RESET the remote database migration history!"
        print_warning "All data will be preserved, but migration history will be rebuilt."
        read -p "Are you absolutely sure? (type 'yes' to confirm): " confirm
        
        if [[ $confirm == "yes" ]]; then
            # This is a more advanced operation that requires careful handling
            print_status "This operation requires manual intervention."
            print_status "Please follow these steps manually:"
            echo ""
            echo "1. Go to your Supabase dashboard"
            echo "2. Navigate to Settings > Database"
            echo "3. Reset the database (this preserves data but resets migration history)"
            echo "4. Come back and run: supabase db push --include-all"
            echo ""
            print_warning "Automated reset not implemented for safety reasons."
        else
            print_warning "Synchronization cancelled by user"
        fi
        ;;
        
    4)
        print_status "Exiting for manual review..."
        echo ""
        echo "Useful commands for manual review:"
        echo "- supabase migration list                    # Show migration status"
        echo "- supabase db diff --linked --schema public  # Show schema differences"
        echo "- supabase db push --dry-run                 # Preview what would be pushed"
        echo "- supabase db pull --dry-run                 # Preview what would be pulled"
        echo ""
        echo "Backups are available in: $BACKUP_DIR"
        ;;
        
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Step 6: Final verification
if [[ $choice -eq 1 || $choice -eq 2 ]]; then
    echo ""
    print_status "Step 6: Final verification..."
    echo "Final migration status:"
    supabase migration list
    echo ""
    
    print_status "Verifying database connection..."
    if supabase status | grep -q "supabase local development setup is running"; then
        print_success "Local Supabase is running"
    else
        print_warning "Local Supabase might not be running"
    fi
    
    print_success "Synchronization process completed!"
    echo ""
    echo "Next steps:"
    echo "1. Test your application with both local and remote environments"
    echo "2. Verify all features work as expected"
    echo "3. Update your team about the synchronization"
    echo ""
    echo "Backups are available in: $BACKUP_DIR"
fi

print_success "Script completed successfully! 🎉"
