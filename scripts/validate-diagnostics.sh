#!/bin/bash
set -euo pipefail

# Quick validation script for the modular diagnostics system
# Ensures all components are present and properly configured

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIAGNOSTICS_DIR="$SCRIPT_DIR/diagnostics"

echo "🔍 Validating modular diagnostics system..."
echo ""

# Check main orchestrator
if [ -f "$SCRIPT_DIR/diagnose-vscode-environment.sh" ] && [ -x "$SCRIPT_DIR/diagnose-vscode-environment.sh" ]; then
    echo "✅ Main orchestrator: diagnose-vscode-environment.sh"
    echo "   Lines: $(wc -l < "$SCRIPT_DIR/diagnose-vscode-environment.sh")"
else
    echo "❌ Main orchestrator missing or not executable"
    exit 1
fi

# Check core module
if [ -f "$DIAGNOSTICS_DIR/core.sh" ] && [ -x "$DIAGNOSTICS_DIR/core.sh" ]; then
    echo "✅ Core module: diagnostics/core.sh"
    echo "   Lines: $(wc -l < "$DIAGNOSTICS_DIR/core.sh")"
else
    echo "❌ Core module missing or not executable"
    exit 1
fi

# Check diagnostic modules
REQUIRED_MODULES=("extensions.sh" "keychain.sh" "cache.sh" "logs.sh")
for module in "${REQUIRED_MODULES[@]}"; do
    if [ -f "$DIAGNOSTICS_DIR/$module" ] && [ -x "$DIAGNOSTICS_DIR/$module" ]; then
        echo "✅ Diagnostic module: diagnostics/$module"
        echo "   Lines: $(wc -l < "$DIAGNOSTICS_DIR/$module")"
    else
        echo "❌ Diagnostic module missing or not executable: $module"
        exit 1
    fi
done

echo ""
echo "🎉 All modular diagnostics components validated successfully!"
echo ""
echo "📊 Size comparison:"
echo "   Original monolithic script: 580+ lines"
echo "   New modular system total: $(find "$SCRIPT_DIR" -name "*.sh" -exec wc -l {} + | tail -1 | awk '{print $1}') lines across $(find "$SCRIPT_DIR" -name "*.sh" | wc -l) files"
echo "   Main orchestrator: $(wc -l < "$SCRIPT_DIR/diagnose-vscode-environment.sh") lines (Copilot-safe)"
echo ""
echo "🚀 The modular diagnostics system is ready for use!"
echo "   Run: ./scripts/diagnose-vscode-environment.sh"
