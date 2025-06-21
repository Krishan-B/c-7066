#!/bin/bash
# Event listener leak detection analyze_listener_leaks() {
    log_section "Analyzing event list    # Report findings
    if [ $total_leaks -gt 0 ]; then
        issues_found=true
        log_warning "\nListener Leak Analysis:"
        log_warning "Total leak warnings: $total_leaks"
        log_warning "Maximum listeners detected: $max_listeners"
        log_warning "Critical threshold violations: $critical_leaks"
        
        # Track and analyze listener count trends
        track_listener_history $max_listeners
        if ! analyze_listener_trend $max_listeners; then
            log_warning "⚠️ Unusual increase in listener count detected!"
        fi
        
        # Detailed leak source analysis
        log_info "\nLeak Source Analysis:"
        while IFS= read -r line; do
            if [[ $line =~ potential\ listener\ LEAK ]]; then
                local hints=($(identify_leak_source "$line"))
                if [ ${#hints[@]} -gt 0 ]; then
                    log_warning "Leak context:"
                    printf "  - %s\n" "${hints[@]}"
                fi
            fi
        done < <(find "$log_dir" -type f -name "*.log" -exec grep -h "potential listener LEAK" {} \;)aks..."
    local issues_found=false
    local log_dir="$HOME/.vscode-remote/logs"
    
    if [ ! -d "$log_dir" ]; then
        log_success "No log directory found (clean session)"
        return 0
    }
    
    # First check if our diagnostics might be causing issues
    if ! check_diagnostic_induced_leaks; then
        log_warning "⚠️ Diagnostic tools may be contributing to listener load"
        issues_found=true
    }sis

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# Thresholds for listener warnings
WARN_THRESHOLD=30      # Standard Node.js warning threshold
CRITICAL_THRESHOLD=100 # Critical leak territory
TREND_THRESHOLD=10     # Significant increase between checks

# Patterns to identify listener leaks
LEAK_PATTERNS=(
    "\[[0-9a-z]+\] potential listener LEAK detected"
    "MOST frequent listener ([0-9]+)"
    "MaxListenersExceededWarning"
    "possible EventEmitter memory leak detected"
    "onDidChange.*disposed"
    "EventEmitter.*memory leak"
)

# Track historical listener counts
HISTORY_FILE="$HOME/.vscode-remote/listener_history.txt"

# Known problematic event patterns
EVENT_PATTERNS=(
    "onDidChange"
    "onDidDispose"
    "onDidSave"
    "onDidOpen"
    "onChange"
    "onUpdate"
)

# Known problematic patterns
KNOWN_LEAK_SOURCES=(
    "*.preview*"
    "*live*"
    "*markdown*"
    "*copilot*"
    "*codeium*"
    "*chat*"
    "*notebook*"
)

analyze_listener_leaks() {
    log_section "Analyzing event listener leaks..."
    local issues_found=false
    local log_dir="$HOME/.vscode-remote/logs"
    
    if [ ! -d "$log_dir" ]; then
        log_success "No log directory found (clean session)"
        return 0
    fi
    
    # Statistics tracking
    declare -A extension_leaks
    declare -A leak_counts
    local total_leaks=0
    local max_listeners=0
    local critical_leaks=0
    
    log_info "Scanning for listener leak patterns..."
    
    # Extract leak information and correlate with extensions
    while IFS= read -r line; do
        if [[ $line =~ potential\ listener\ LEAK\ detected.*having\ ([0-9]+)\ listeners ]]; then
            local listener_count="${BASH_REMATCH[1]}"
            ((total_leaks++))
            
            # Track maximum listener count
            if (( listener_count > max_listeners )); then
                max_listeners=$listener_count
            fi
            
            # Categorize leak severity
            if (( listener_count > CRITICAL_THRESHOLD )); then
                ((critical_leaks++))
            fi
            
            # Try to extract extension context
            local extension_context
            if [[ $line =~ \[(.*?)\] ]]; then
                extension_context="${BASH_REMATCH[1]}"
                ((extension_leaks[$extension_context]++))
            fi
            
            # Extract source component if available
            if [[ $line =~ MOST\ frequent\ listener\ \((.*?)\) ]]; then
                local source="${BASH_REMATCH[1]}"
                ((leak_counts[$source]++))
            fi
        fi
    done < <(find "$log_dir" -type f -name "*.log" -exec grep -h -E "$(IFS="|"; echo "${LEAK_PATTERNS[*]}")" {} \;)
    
    # Analyze findings
    if [ $total_leaks -gt 0 ]; then
        issues_found=true
        log_warning "\nListener Leak Analysis:"
        log_warning "Total leak warnings: $total_leaks"
        log_warning "Maximum listeners detected: $max_listeners"
        log_warning "Critical threshold violations: $critical_leaks"
        
        # Report extension-specific leaks
        if [ ${#extension_leaks[@]} -gt 0 ]; then
            log_info "\nExtension Leak Distribution:"
            for ext in "${!extension_leaks[@]}"; do
                log_warning "- $ext: ${extension_leaks[$ext]} occurrences"
            done
        fi
        
        # Report frequent leak sources
        if [ ${#leak_counts[@]} -gt 0 ]; then
            log_info "\nMost Frequent Leak Sources:"
            for source in "${!leak_counts[@]}"; do
                log_warning "- $source: ${leak_counts[$source]} occurrences"
            done
        fi
        
        # Check for known problematic patterns
        check_known_leak_patterns
        
        # Provide recommendations
        generate_recommendations
    else
        log_success "No listener leaks detected"
    fi
    
    return $( [ "$issues_found" = true ] && echo 1 || echo 0)
}

check_known_leak_patterns() {
    log_info "\nChecking for known leak patterns..."
    local found_patterns=0
    
    for pattern in "${KNOWN_LEAK_SOURCES[@]}"; do
        if grep -q "$pattern" "$log_dir"/*.log 2>/dev/null; then
            ((found_patterns++))
            log_warning "- Detected known leak pattern: $pattern"
        fi
    done
    
    if [ $found_patterns -gt 0 ]; then
        log_warning "Found $found_patterns known problematic patterns"
    fi
}

generate_recommendations() {
    log_info "\nRecommendations:"
    
    if [ $critical_leaks -gt 0 ]; then
        log_warning "Critical Issues Detected!"
        log_warning "1. Run 'Developer: Show Running Extensions' to identify heavy extensions"
        log_warning "2. Consider disabling extensions matching leak patterns"
        log_warning "3. Run 'Developer: Startup Performance' for detailed analysis"
    fi
    
    log_info "General Actions:"
    log_info "1. Reload Window to clear stale listeners"
    log_info "2. Review recently installed or updated extensions"
    log_info "3. Check extension logs for initialization errors"
    
    if [ ${#extension_leaks[@]} -gt 0 ]; then
        log_info "\nSpecific Extension Recommendations:"
        for ext in "${!extension_leaks[@]}"; do
            if [ "${extension_leaks[$ext]}" -gt 5 ]; then
                log_warning "- Consider temporarily disabling: $ext"
            fi
        done
    fi
}

# Track listener counts over time
track_listener_history() {
    local current_count=$1
    local timestamp=$(date +%s)
    
    # Create history file if it doesn't exist
    touch "$HISTORY_FILE" 2>/dev/null || return 1
    
    # Add new entry
    echo "$timestamp $current_count" >> "$HISTORY_FILE"
    
    # Keep only last 10 entries
    if [ $(wc -l < "$HISTORY_FILE") -gt 10 ]; then
        tail -n 10 "$HISTORY_FILE" > "$HISTORY_FILE.tmp"
        mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
    fi
}

analyze_listener_trend() {
    local current_count=$1
    
    if [ ! -f "$HISTORY_FILE" ]; then
        return 0
    fi
    
    # Get previous count
    local prev_count=$(tail -n 2 "$HISTORY_FILE" | head -n 1 | awk '{print $2}')
    
    if [ -n "$prev_count" ]; then
        local increase=$((current_count - prev_count))
        if [ $increase -gt $TREND_THRESHOLD ]; then
            log_warning "Listener count increased by $increase since last check!"
            return 1
        fi
    fi
    
    return 0
}

identify_leak_source() {
    local log_content="$1"
    local source_hints=()
    
    # Extract context tags [1d1] etc.
    if [[ $log_content =~ \[([0-9a-z]+)\] ]]; then
        local context_tag="${BASH_REMATCH[1]}"
        source_hints+=("Context tag: $context_tag")
    fi
    
    # Check for specific event patterns
    for pattern in "${EVENT_PATTERNS[@]}"; do
        if [[ $log_content =~ $pattern ]]; then
            source_hints+=("Event type: $pattern")
        fi
    done
    
    # Look for extension identifiers
    if [[ $log_content =~ extension\.([a-zA-Z0-9\-\.]+) ]]; then
        source_hints+=("Extension: ${BASH_REMATCH[1]}")
    fi
    
    # Check for common leak scenarios
    if [[ $log_content =~ onDidChange.*disposed ]]; then
        source_hints+=("Likely cause: Accessing disposed model")
    elif [[ $log_content =~ frequent.*listener ]]; then
        source_hints+=("Likely cause: Repeated event registration")
    fi
    
    echo "${source_hints[@]}"
}

check_diagnostic_induced_leaks() {
    log_info "Checking for diagnostic-induced leaks..."
    
    # Get process tree of diagnostic scripts
    local diagnostic_pids=$(pgrep -f "diagnose-vscode-environment.sh")
    if [ -n "$diagnostic_pids" ]; then
        # Check if any diagnostic process is repeatedly accessing files
        for pid in $diagnostic_pids; do
            local file_ops=$(sudo lsof -p $pid 2>/dev/null | grep -c "REG")
            if [ "$file_ops" -gt 100 ]; then
                log_warning "Possible diagnostic-induced file operation overload (PID: $pid)"
                return 1
            fi
        done
    fi
    
    return 0
}

# Run analysis if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    analyze_listener_leaks
fi
