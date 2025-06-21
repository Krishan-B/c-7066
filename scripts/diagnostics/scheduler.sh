#!/bin/bash
# Scheduler performance monitorinanalyze_scheduler_health() {
    log_section "Analyzing VS Code Web scheduler health..."
    local issues_found=false
    local log_dir="$HOME/.vscode-remote/logs"
    
    if [ ! -d "$log_dir" ]; then
        log_success "No log directory found (clean session)"
        return 0
    }
    
    # Check system resource pressure first
    if check_resource_pressure; then
        log_warning "⚠️ System resource pressure detected - may affect performance"
        issues_found=true
    fi
    
    # Track delay statistics
    local total_delays=0
    local max_delay=0
    local delay_count=0
    declare -A category_delaysics

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# Performance thresholds (in milliseconds)
WARN_THRESHOLD=50      # Standard frame budget
CRITICAL_THRESHOLD=200 # Severe UI blocking
TREND_THRESHOLD=20     # Significant delay increase

# Task categories and their budgets
declare -A TASK_BUDGETS=(
    ["extension_host"]=100
    ["file_search"]=150
    ["syntax_highlight"]=50
    ["git"]=200
    ["format"]=300
    ["workspace_scan"]=250
)

# Patterns to identify scheduler issues
SCHEDULER_PATTERNS=(
    "task queue exceeded allotted deadline"
    "Long running operation"
    "Long frame"
    "Slow extension host"
    "workbench\.web\.main.*exceeded"
    "Rendering.*took.*ms"
    "extension.*activation.*slow"
)

# Performance history file
PERF_HISTORY_FILE="$HOME/.vscode-remote/perf_history.json"

# Known heavy operations
HEAVY_OPERATIONS=(
    "format-on-save"
    "git-status"
    "search-index"
    "extension-scan"
    "workspace-trust"
    "node-modules-watch"
    "markdown-preview"
)

analyze_scheduler_health() {
    log_section "Analyzing VS Code Web scheduler health..."
    local issues_found=false
    local log_dir="$HOME/.vscode-remote/logs"
    
    if [ ! -d "$log_dir" ]; then
        log_success "No log directory found (clean session)"
        return 0
    fi
    
    # Track delay statistics
    local total_delays=0
    local max_delay=0
    local delay_count=0
    
    # Parse logs for scheduler delays
    while IFS= read -r line; do
        if [[ $line =~ "task queue exceeded allotted deadline by "([0-9]+)"ms" ]]; then
            delay=${BASH_REMATCH[1]}
            ((total_delays += delay))
            ((delay_count++))
            
            if (( delay > max_delay )); then
                max_delay=$delay
            fi
            
            # Identify task category
            local category="unknown"
            for cat in "${!TASK_BUDGETS[@]}"; do
                if [[ $line =~ $cat ]]; then
                    category=$cat
                    break
                fi
            done
            
            # Track per-category delays
            category_delays[$category]=$((${category_delays[$category]:-0} + delay))
            
            # Track performance history
            track_performance_history "$delay" "$category"
            
            # Identify heavy tasks
            local heavy_tasks=($(identify_heavy_tasks "$line"))
            if [ ${#heavy_tasks[@]} -gt 0 ]; then
                log_warning "Heavy tasks detected during delay:"
                printf "  - %s\n" "${heavy_tasks[@]}"
            fi
            
            if (( delay > CRITICAL_THRESHOLD )); then
                log_error "Critical scheduler delay: ${delay}ms"
                issues_found=true
            elif (( delay > WARN_THRESHOLD )); then
                log_warning "High scheduler delay: ${delay}ms"
                issues_found=true
            fi
        fi
    done < <(find "$log_dir" -type f -name "*.log" -exec grep -h "task queue exceeded" {} \;)
    
    # Report statistics if delays were found
    if (( delay_count > 0 )); then
        local avg_delay=$((total_delays / delay_count))
        log_info "\nScheduler Statistics:"
        log_info "- Average delay: ${avg_delay}ms"
        log_info "- Maximum delay: ${max_delay}ms"
        log_info "- Total occurrences: $delay_count"
        
        # Analyze performance trend
        if ! analyze_performance_trend "$max_delay"; then
            issues_found=true
        fi
        
        # Report per-category statistics
        log_info "\nDelay Distribution by Category:"
        for category in "${!category_delays[@]}"; do
            local cat_delay=${category_delays[$category]}
            local budget=${TASK_BUDGETS[$category]:-$WARN_THRESHOLD}
            if (( cat_delay > budget )); then
                log_warning "- $category: ${cat_delay}ms (exceeds ${budget}ms budget)"
            else
                log_info "- $category: ${cat_delay}ms"
            fi
        done
        
        # Get and display optimization suggestions
        log_info "\nOptimization Suggestions:"
        while IFS= read -r suggestion; do
            log_info "- $suggestion"
        done < <(suggest_optimizations "$line")
        
        # Provide recommendations based on severity
        if (( max_delay > CRITICAL_THRESHOLD )); then
            log_warning "Recommendations:"
            log_warning "- Consider disabling heavy extensions temporarily"
            log_warning "- Check CPU usage and available memory"
            log_warning "- Avoid opening large files"
            log_warning "- Run 'Reload Window' command to reset UI state"
        fi
    else
        log_success "No significant scheduler delays detected"
    fi
    
    return $( [ "$issues_found" = true ] && echo 1 || echo 0)
}

track_performance_history() {
    local delay=$1
    local category=$2
    local timestamp=$(date +%s)
    
    # Create history file if it doesn't exist
    if [ ! -f "$PERF_HISTORY_FILE" ]; then
        echo '{"history":[]}' > "$PERF_HISTORY_FILE"
    fi
    
    # Add new entry
    local entry=$(jq -c \
        --arg ts "$timestamp" \
        --arg d "$delay" \
        --arg c "$category" \
        '.history += [{timestamp: $ts, delay: $d|tonumber, category: $c}]' \
        "$PERF_HISTORY_FILE")
    
    echo "$entry" > "$PERF_HISTORY_FILE"
    
    # Keep only last 100 entries
    local trimmed=$(jq '.history |= .[-100:]' "$PERF_HISTORY_FILE")
    echo "$trimmed" > "$PERF_HISTORY_FILE"
}

analyze_performance_trend() {
    local current_delay=$1
    
    if [ ! -f "$PERF_HISTORY_FILE" ]; then
        return 0
    fi
    
    # Calculate moving average
    local avg_delay=$(jq -r '.history[-10:] | map(.delay) | add / length' "$PERF_HISTORY_FILE")
    
    # Check for concerning trends
    if (( $(echo "$current_delay > $avg_delay * 1.5" | bc -l) )); then
        log_warning "Current delay ($current_delay ms) is significantly above recent average ($avg_delay ms)"
        return 1
    fi
    
    return 0
}

identify_heavy_tasks() {
    local log_content="$1"
    local heavy_tasks=()
    
    # Check each known heavy operation
    for op in "${HEAVY_OPERATIONS[@]}"; do
        if [[ $log_content =~ $op ]]; then
            heavy_tasks+=("$op")
        fi
    done
    
    # Look for extension activations
    if [[ $log_content =~ extension\.([a-zA-Z0-9\-\.]+).*activation ]]; then
        heavy_tasks+=("extension-activation: ${BASH_REMATCH[1]}")
    fi
    
    # Check for file operations
    if [[ $log_content =~ (watching|indexing|scanning).*files ]]; then
        heavy_tasks+=("file-operations: ${BASH_REMATCH[0]}")
    fi
    
    echo "${heavy_tasks[@]}"
}

check_resource_pressure() {
    log_info "Checking system resource pressure..."
    
    # Check CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}')
    
    # Check memory pressure
    local mem_free=$(free -m | awk '/^Mem:/ {print $4}')
    local swap_used=$(free -m | awk '/^Swap:/ {print $3}')
    
    local pressure_detected=false
    
    if (( $(echo "$cpu_load > 2.0" | bc -l) )); then
        log_warning "High CPU load detected: $cpu_load"
        pressure_detected=true
    fi
    
    if [ "$mem_free" -lt 500 ]; then
        log_warning "Low memory available: ${mem_free}MB free"
        pressure_detected=true
    fi
    
    if [ "$swap_used" -gt 1000 ]; then
        log_warning "High swap usage: ${swap_used}MB used"
        pressure_detected=true
    fi
    
    return $( [ "$pressure_detected" = true ] && echo 1 || echo 0)
}

suggest_optimizations() {
    local delay_pattern=$1
    local suggestions=()
    
    # Check for known patterns
    if [[ $delay_pattern =~ extension ]]; then
        suggestions+=(
            "Run 'Developer: Show Running Extensions' to identify heavy extensions"
            "Consider disabling non-critical extensions during peak work"
        )
    fi
    
    if [[ $delay_pattern =~ file|workspace ]]; then
        suggestions+=(
            "Review workspace file exclusions in settings.json"
            "Consider adding large directories to files.watcherExclude"
        )
    fi
    
    if [[ $delay_pattern =~ git ]]; then
        suggestions+=(
            "Check .gitignore for large directories"
            "Consider using git sparse-checkout for large repositories"
        )
    fi
    
    if check_resource_pressure; then
        suggestions+=(
            "System resources are constrained - consider closing unused editors/terminals"
            "Review extension memory usage in 'Developer: Show Running Extensions'"
        )
    fi
    
    printf '%s\n' "${suggestions[@]}"
}

# Run analysis if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    analyze_scheduler_health
fi
