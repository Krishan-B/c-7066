#!/bin/bash
set -euo pipefail

# Restore files removed during reorganization
# This script will restore files removed during the workspace reorganization

BACKUP_DIR="/workspaces/Trade-Pro/backups/workspace_reorg_20250630_074302"
WORKSPACE_ROOT="/workspaces/Trade-Pro"

echo "🔄 Starting file restoration process..."

# Function to restore a file from backup
restore_file() {
    local source_file="$1"
    local target_file="$2"
    
    if [ -f "$source_file" ]; then
        echo "📋 Restoring $target_file"
        cp "$source_file" "$target_file"
    else
        echo "⚠️ Backup not found for $target_file"
    fi
}

# Restore Supabase auth test file
restore_file "$BACKUP_DIR/duplicates/test-supabase-auth.js" "$WORKSPACE_ROOT/test-supabase-auth.js"

# Restore diagnostic script backup
restore_file "$BACKUP_DIR/duplicates/diagnose-vscode-environment.sh.backup" "$WORKSPACE_ROOT/scripts/diagnose-vscode-environment.sh.backup"

echo "✅ Restoration complete"
