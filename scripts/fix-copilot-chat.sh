#!/bin/bash

# GitHub Copilot Chat Error Fix Script
# This script addresses the database client tool validation errors

echo "🔧 Fixing GitHub Copilot Chat Database Tool Validation Errors..."
echo ""

# Check if VS Code is running
if pgrep -f "code" > /dev/null; then
    echo "✅ VS Code is running"
else
    echo "❌ VS Code is not running - please start VS Code first"
    exit 1
fi

# Instructions for manual steps (since we can't directly control VS Code commands from script)
echo "📋 Please execute the following commands in VS Code:"
echo ""
echo "1. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)"
echo "2. Type and execute: 'GitHub Copilot: Sign Out' (then sign back in)"
echo "3. Press Ctrl+Shift+P again"
echo "4. Type and execute: 'GitHub Copilot Chat: Reset Session'"
echo "5. Press Ctrl+Shift+P again"
echo "6. Type and execute: 'Developer: Restart Extension Host'"
echo ""
echo "💡 Alternative commands if the above don't work:"
echo "   - 'GitHub Copilot: Restart Language Server'"
echo "   - 'GitHub Copilot Chat: Clear Session'"
echo "   - 'Developer: Reload Window'"
echo ""

# Clear any cached extension data
echo "🧹 Clearing extension cache..."
CACHE_DIRS=(
    "$HOME/.vscode/extensions/.cache"
    "$HOME/.config/Code/CachedExtensions"
    "$HOME/.config/Code/logs"
)

for dir in "${CACHE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "✅ Cleared: $dir"
    else
        echo "ℹ️  Not found: $dir"
    fi
done

echo ""
echo "🎯 Fix Summary:"
echo "   - Added Copilot Chat database tool fixes to .vscode/settings.json"
echo "   - Disabled experimental database support"
echo "   - Cleared extension cache"
echo ""
echo "⚠️  Important: You must manually restart GitHub Copilot Chat using the commands above"
echo "🔄 After executing the VS Code commands, the database tool validation errors should be resolved"
echo ""
echo "📖 For more details, see: docs/RENDERER_ERROR_FIXES.md"
