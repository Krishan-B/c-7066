#!/bin/bash
set -euo pipefail

# Simple test of the modular diagnostics system

echo "🧪 Testing modular diagnostics system..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIAGNOSTICS_DIR="$SCRIPT_DIR/diagnostics"

echo "📂 Script directory: $SCRIPT_DIR"
echo "📂 Diagnostics directory: $DIAGNOSTICS_DIR"

# Test core module
if [ -f "$DIAGNOSTICS_DIR/core.sh" ]; then
    echo "✅ Core module exists"
    source "$DIAGNOSTICS_DIR/core.sh"
    init_logging
    log_info "Core module loaded successfully"
    log_success "Logging functions work!"
else
    echo "❌ Core module missing"
    exit 1
fi

# Test individual modules
MODULES=("extensions.sh" "keychain.sh" "cache.sh" "logs.sh")

for module in "${MODULES[@]}"; do
    if [ -f "$DIAGNOSTICS_DIR/$module" ]; then
        echo "✅ Module exists: $module"
        if [ -x "$DIAGNOSTICS_DIR/$module" ]; then
            echo "✅ Module is executable: $module"
        else
            echo "⚠️  Module not executable: $module"
        fi
    else
        echo "❌ Module missing: $module"
    fi
done

echo ""
echo "🎯 Test complete! Modular diagnostics system appears ready."
echo ""
echo "💡 To run full diagnostics:"
echo "   ./scripts/diagnose-vscode-environment.sh"
echo ""
echo "💡 To run individual modules:"
for module in "${MODULES[@]}"; do
    echo "   ./scripts/diagnostics/$module"
done
