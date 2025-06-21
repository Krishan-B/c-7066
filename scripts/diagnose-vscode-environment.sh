#!/bin/bash
set -euo pipefail

# Orchestrator for VS Code environment diagnostics using modular components
# Runs comprehensive health checks across all areas: extensions, cache, keychain, logs

# --- Configuration ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIAGNOSTICS_DIR="$SCRIPT_DIR/diagnostics"

# Source the core diagnostics library
if [ ! -f "$DIAGNOSTICS_DIR/core.sh" ]; then
    echo "❌ Error: Core diagnostics library not found at $DIAGNOSTICS_DIR/core.sh"
    echo "💡 Please ensure the modular diagnostics are properly installed."
    exit 1
fi

source "$DIAGNOSTICS_DIR/core.sh"

# Diagnostic modules to run in order
DIAGNOSTIC_MODULES=(
    "extensions"
    "cache"
    "keychain"
    "logs"
    "scheduler"
    "headers"
    "websocket"
    "listeners"
    "workspace"
    "save-hooks"
    "similarity"
)

# --- Functions ---

print_header() {
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    🔍 VS CODE ENVIRONMENT DIAGNOSTICS                        ║"
    echo "║                      Comprehensive Health & Issue Detection                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

run_diagnostic_module() {
    local module_name="$1"
    local module_path="$DIAGNOSTICS_DIR/$module_name"
    
    if [ ! -f "$module_path" ]; then
        log_error "Diagnostic module '$module_name' not found at $module_path"
        return 1
    fi
    
    if [ ! -x "$module_path" ]; then
        log_info "Making '$module_name' executable..."
        chmod +x "$module_path"
    fi
    
    log_info "Running diagnostic module: $module_name"
    echo "───────────────────────────────────────────────────────────────────────────────"
    
    if "$module_path"; then
        log_success "$module_name completed successfully"
        return 0
    else
        log_error "$module_name failed with exit code $?"
        return 1
    fi
}

print_module_header() {
    local module="$1"
    case "$module" in
        "extensions.sh")
            echo ""
            echo "┌─────────────────────────────────────────────────────────────────────────────┐"
            echo "│  🔌 EXTENSION HEALTH & CONFLICT DETECTION                                    │"
            echo "└─────────────────────────────────────────────────────────────────────────────┘"
            ;;
        "keychain.sh")
            echo ""
            echo "┌─────────────────────────────────────────────────────────────────────────────┐"
            echo "│  🔑 KEYCHAIN & AUTHENTICATION STORAGE HEALTH                                │"
            echo "└─────────────────────────────────────────────────────────────────────────────┘"
            ;;
        "cache.sh")
            echo ""
            echo "┌─────────────────────────────────────────────────────────────────────────────┐"
            echo "│  🗂️  CACHE & STORAGE BLOAT DETECTION                                        │"
            echo "└─────────────────────────────────────────────────────────────────────────────┘"
            ;;
        "logs.sh")
            echo ""
            echo "┌─────────────────────────────────────────────────────────────────────────────┐"
            echo "│  📋 LOG ANALYSIS & ERROR SIGNAL DETECTION                                   │"
            echo "└─────────────────────────────────────────────────────────────────────────────┘"
            ;;
        "scheduler.sh")
            echo ""
            echo "┌─────────────────────────────────────────────────────────────────────────────┐"
            echo "│  ⏰ SCHEDULER & BACKGROUND TASK HEALTH                                       │"
            echo "└─────────────────────────────────────────────────────────────────────────────┘"
            ;;
    esac
}

print_summary() {
    local passed="$1"
    local failed="$2"
    local total="$3"
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                            📊 DIAGNOSTIC SUMMARY                             ║"
    echo "╠═══════════════════════════════════════════════════════════════════════════════╣"
    printf "║  Total Modules: %-3d  │  Passed: %-3d  │  Failed: %-3d                     ║\n" "$total" "$passed" "$failed"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    
    if [ "$failed" -eq 0 ]; then
        echo ""
        log_success "�� ALL DIAGNOSTIC MODULES PASSED!"
        echo "✨ Your VS Code environment appears to be in excellent health."
        echo "🚀 No critical issues detected that would cause InstantiationService or keychain errors."
    else
        echo ""
        log_warning "⚠️  Some diagnostic modules detected issues."
        echo "💡 Review the output above for specific recommendations."
        echo "🔧 Run individual diagnostic modules for more detailed analysis if needed."
    fi
}

provide_general_recommendations() {
    echo ""
    echo "📝 GENERAL RECOMMENDATIONS:"
    echo ""
    echo "• Run diagnostics regularly to maintain environment health"
    echo "• Keep VS Code and extensions updated to latest stable versions"
    echo "• Clear cache periodically if you notice performance issues"
    echo "• Monitor log files for recurring error patterns"
    echo "• Use individual diagnostic modules for targeted troubleshooting:"
    echo "  - scripts/diagnostics/extensions.sh  (extension conflicts)"
    echo "  - scripts/diagnostics/keychain.sh    (auth/keychain issues)"
    echo "  - scripts/diagnostics/cache.sh       (cache bloat)"
    echo "  - scripts/diagnostics/logs.sh        (log analysis)"
    echo ""
}

# --- Main Execution ---

main() {
    # Initialize logging
    init_logging
    
    print_header
    
    local total_modules=${#DIAGNOSTIC_MODULES[@]}
    local passed_modules=0
    local failed_modules=0
    
    # Run each diagnostic module
    for module in "${DIAGNOSTIC_MODULES[@]}"; do
        print_module_header "$module"
        
        if run_diagnostic_module "$module"; then
            ((passed_modules++))
        else
            ((failed_modules++))
        fi
        
        echo ""
    done
    
    print_summary "$passed_modules" "$failed_modules" "$total_modules"
    provide_general_recommendations
    
    echo "🎯 VS Code environment diagnostic completed!"
    
    # Exit with failure if any modules failed
    if [ "$failed_modules" -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function
main "$@"
