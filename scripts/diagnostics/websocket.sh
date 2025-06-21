#!/bin/bash
# WebSocket health monitoring for VS Code Web client

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# WebSocket-related patterns to watch for
WEBSOCKET_PATTERNS=(
    "web-socket-1 undefined"
    "websocket.*connection.*failed"
    "websocket.*error"
    "Failed to connect to VS Code server"
    "Connection closed abnormally"
)

# Components that commonly use WebSockets
WEBSOCKET_COMPONENTS=(
    "workbench-page"
    "codespaces-component"
    "github\.copilot"
    "extension-host"
    "terminal-renderer"
)

analyze_websocket_health() {
    log_section "Analyzing VS Code Web WebSocket health..."
    local issues_found=false
    local log_dir="$HOME/.vscode-remote/logs"
    local detail_level=${1:-"normal"}  # Can be "normal" or "verbose"
    
    if [ ! -d "$log_dir" ]; then
        log_success "No log directory found (clean session)"
        return 0
    }
    
    # Statistics tracking
    local undefined_count=0
    local error_count=0
    local component_issues=()
    declare -A component_stats
    
    log_info "Scanning logs for WebSocket-related issues..."
    
    # First pass: Count undefined payloads per component
    while IFS= read -r line; do
        if [[ $line =~ vscs:web-client:[0-9]+:(.*):.*web-socket-[0-9]+ undefined ]]; then
            local component="${BASH_REMATCH[1]}"
            ((undefined_count++))
            ((component_stats[$component]++))
            
            if [ "$detail_level" = "verbose" ]; then
                log_warning "Undefined payload in component: $component"
            fi
        fi
    done < <(find "$log_dir" -type f -name "*.log" -exec grep -h "web-socket.*undefined" {} \;)
    
    # Second pass: Look for explicit WebSocket errors
    while IFS= read -r line; do
        for pattern in "${WEBSOCKET_PATTERNS[@]}"; do
            if [[ $line =~ $pattern ]]; then
                ((error_count++))
                issues_found=true
                
                if [ "$detail_level" = "verbose" ]; then
                    log_error "WebSocket error detected: $line"
                fi
                break
            fi
        done
    done < <(find "$log_dir" -type f -name "*.log" -exec grep -h -E "$(IFS="|"; echo "${WEBSOCKET_PATTERNS[*]}")" {} \;)
    
    # Report findings
    if [ $undefined_count -gt 0 ] || [ $error_count -gt 0 ]; then
        log_warning "WebSocket Health Summary:"
        log_warning "- Undefined payloads: $undefined_count"
        log_warning "- Error events: $error_count"
        
        # Report per-component statistics
        if [ ${#component_stats[@]} -gt 0 ]; then
            log_info "\nComponent Analysis:"
            for component in "${!component_stats[@]}"; do
                log_info "- $component: ${component_stats[$component]} undefined payloads"
            done
        fi
        
        # Provide recommendations based on findings
        if [ $error_count -gt 0 ] || [ $undefined_count -gt 10 ]; then
            log_warning "\nRecommendations:"
            log_warning "1. Run 'Reload Window' command to reset WebSocket connections"
            log_warning "2. Check GitHub Copilot connection status"
            log_warning "3. Review extensions using WebSocket connections"
            log_warning "4. Consider running 'Codespaces: Show Codespace Logs' for detailed analysis"
            issues_found=true
        elif [ $undefined_count -gt 0 ]; then
            log_info "\nNote: Some undefined payloads detected but within normal range"
            log_info "This is common during initialization and can usually be ignored"
        fi
    else
        log_success "No significant WebSocket issues detected"
    fi
    
    # Check for specific component health
    check_component_health
    
    return $( [ "$issues_found" = true ] && echo 1 || echo 0)
}

check_component_health() {
    local components_checked=0
    local components_with_issues=0
    
    log_info "\nChecking critical component WebSocket health..."
    
    for component in "${WEBSOCKET_COMPONENTS[@]}"; do
        ((components_checked++))
        
        # Look for recent errors in this component
        if grep -q "$component.*web-socket.*error" "$log_dir"/*.log 2>/dev/null; then
            ((components_with_issues++))
            log_warning "- Issues detected in $component"
        fi
    done
    
    if [ $components_with_issues -eq 0 ]; then
        log_success "All monitored components healthy"
    else
        log_warning "$components_with_issues out of $components_checked components show recent issues"
    fi
}

# Run analysis if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    # Check if verbose flag is passed
    if [ "${1:-}" = "--verbose" ]; then
        analyze_websocket_health "verbose"
    else
        analyze_websocket_health "normal"
    fi
fi
