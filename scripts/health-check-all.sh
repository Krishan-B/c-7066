#!/bin/bash
set -euo pipefail

# Master health check script for the Trade-Pro development environment
# Runs all diagnostic scripts in sequence to ensure a fully healthy setup

# --- Configuration ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Health check scripts to run in order
HEALTH_CHECKS=(
    "lint-json-configs.sh"
    "assert-vscode-health.sh" 
    "diagnose-vscode-environment.sh"
    "assert-local-db-health.sh"
)

# --- Functions ---

print_header() {
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                     🏥 TRADE-PRO ENVIRONMENT HEALTH CHECK                    ║"
    echo "║                          Comprehensive Development Setup Validation           ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

print_section() {
    local title="$1"
    local width=79
    local padding=$(( (width - ${#title} - 4) / 2 ))
    
    echo ""
    echo "┌$(printf '%*s' $width | tr ' ' '─')┐"
    printf "│%*s %s %*s│\n" $padding "" "$title" $padding ""
    echo "└$(printf '%*s' $width | tr ' ' '─')┘"
    echo ""
}

run_health_check() {
    local script_name="$1"
    local script_path="$SCRIPT_DIR/$script_name"
    
    if [ ! -f "$script_path" ]; then
        echo "❌ Error: Health check script '$script_name' not found at $script_path"
        return 1
    fi
    
    if [ ! -x "$script_path" ]; then
        echo "⚠️  Making '$script_name' executable..."
        chmod +x "$script_path"
    fi
    
    echo "🏃 Running: $script_name"
    echo "───────────────────────────────────────────────────────────────────────────────"
    
    if "$script_path"; then
        echo "✅ $script_name completed successfully"
        return 0
    else
        echo "❌ $script_name failed with exit code $?"
        return 1
    fi
}

print_summary() {
    local passed="$1"
    local failed="$2"
    local total="$3"
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                📊 HEALTH SUMMARY                             ║"
    echo "╠═══════════════════════════════════════════════════════════════════════════════╣"
    printf "║  Total Checks: %-3d  │  Passed: %-3d  │  Failed: %-3d                      ║\n" "$total" "$passed" "$failed"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    
    if [ "$failed" -eq 0 ]; then
        echo ""
        echo "🎉 ALL HEALTH CHECKS PASSED! Your development environment is in excellent shape."
        echo "🚀 You're ready to code with confidence!"
    else
        echo ""
        echo "⚠️  Some health checks failed. Please review the output above and take action."
        echo "💡 Run individual scripts for more detailed diagnostics if needed."
    fi
}

# --- Main Execution ---

main() {
    cd "$WORKSPACE_ROOT"
    
    print_header
    
    local total_checks=${#HEALTH_CHECKS[@]}
    local passed_checks=0
    local failed_checks=0
    
    for script in "${HEALTH_CHECKS[@]}"; do
        case "$script" in
            "lint-json-configs.sh")
                print_section "📋 JSON Configuration Validation"
                ;;
            "assert-vscode-health.sh")
                print_section "🔌 VS Code Extension Health"
                ;;
            "diagnose-vscode-environment.sh")
                print_section "🔍 VS Code Environment Diagnostics"
                ;;
            "assert-local-db-health.sh")
                print_section "🗄️  Supabase Database Health"
                ;;
        esac
        
        if run_health_check "$script"; then
            ((passed_checks++))
        else
            ((failed_checks++))
        fi
        
        echo ""
    done
    
    print_summary "$passed_checks" "$failed_checks" "$total_checks"
    
    # Exit with failure if any checks failed
    if [ "$failed_checks" -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

main "$@"
