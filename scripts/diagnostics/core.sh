#!/bin/bash
# Core diagnostic functions and configuration shared across all diagnostic modules

# --- Configuration ---
export LARGE_FILE_THRESHOLD_MB=5
export VERY_LARGE_FILE_THRESHOLD_MB=10

# Known problematic extension patterns
export PROBLEMATIC_EXTENSIONS=(
    "ms-vscode.remote-server"
    "ms-vscode.remote-explorer" 
    "ms-vscode-remote.remote-containers-preview"
    "supabase.supabase-vscode"
    "*.deprecated"
)

# Extensions known to cause InstantiationService disposal issues
export DISPOSAL_PRONE_EXTENSIONS=(
    "*terminal*" "*link*" "*markdown*" "*preview*" "*copilot*" "*live*"
)

# Extensions that commonly use secure storage/keychain
export KEYCHAIN_DEPENDENT_EXTENSIONS=(
    "github.copilot" "github.copilot-chat" "ms-vscode.github-auth"
    "ms-azure-account" "ms-vscode-remote.remote-containers"
)

# --- Utility Functions ---
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

get_file_size_mb() {
  local file="$1"
  if [ -f "$file" ]; then
    local size_bytes=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")
    echo $((size_bytes / 1024 / 1024))
  else
    echo "0"
  fi
}

# --- Logging Functions ---
init_logging() {
    # Initialize logging - can be used to set up log files or formatting in the future
    return 0
}

log_success() { echo "✅ $1"; }
log_warning() { echo "⚠️  $1"; }
log_error() { echo "❌ $1"; }
log_info() { echo "ℹ️  $1"; }
log_section() { echo "🔍 $1"; }
