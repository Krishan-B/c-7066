#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Enhanced script with robust logging and error handling

echo "🚀 Initializing Supabase services for the Trade-Pro workspace..."
DEBUG_LOG="/tmp/supabase_debug.log"
echo "📝 Full debug log will be saved to $DEBUG_LOG"
# Clear previous log
> "$DEBUG_LOG"

# Check if VS Code CLI is available
echo "📦 Checking for VS Code CLI ('code')..."
if ! command -v code &> /dev/null; then
  echo "❌ VS Code CLI ('code') not found. Please ensure it's available in PATH." | tee -a "$DEBUG_LOG"
  exit 1
fi
echo "✅ VS Code CLI found."

# 1. Check if Supabase CLI is installed locally via npx
echo "📦 Checking Supabase CLI with: npx supabase --version"
if ! npx supabase --version &>> "$DEBUG_LOG"; then
    echo "❌ Error: Supabase CLI is not found or failed to run via npx." | tee -a "$DEBUG_LOG"
    echo "💡 Please ensure it is installed as a dev dependency by running: 'npm install supabase --save-dev'" | tee -a "$DEBUG_LOG"
    exit 1
fi
echo "✅ Supabase CLI found."

# 2. Verify Supabase project is linked
echo "🔗 Verifying Supabase project link..."
if [ ! -f "./supabase/config.toml" ] || ! grep -q "project_id" "./supabase/config.toml"; then
    echo "❌ Error: Supabase project is not properly linked." | tee -a "$DEBUG_LOG"
    echo "💡 Please run 'npx supabase link --project-ref <PROJECT_ID>' and try again." | tee -a "$DEBUG_LOG"
    exit 1
fi
echo "✅ Supabase project is linked."

# 3. Start Supabase services with debug logging
echo "⚙️  Starting Supabase services with debug output..."
if ! npx supabase start --debug &>> "$DEBUG_LOG"; then
  echo "🚨 Supabase failed to start. Review the log for details."
  echo "📄 Log file: $DEBUG_LOG"
  exit 1
fi
echo "✅ Supabase services started successfully."

# 4. Final status check
echo "🎉 Supabase is ready!"
echo "🔍 You can check the status at any time by running: npx supabase status"
