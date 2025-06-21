#!/bin/bash
# Save hooks and formatter performance diagnostics

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# Thresholds for save operations (in milliseconds)
SAVE_WARN_THRESHOLD=1000
SAVE_CRITICAL_THRESHOLD=1500
FORMAT_WARN_THRESHOLD=2000

# Patterns to identify save-related issues
SAVE_PATTERNS=(
    "Aborted onWillSaveTextDocument-event after"
    "Save participants took"
    "formatOnSave timed out"
    "Save operation failed"
    "willSaveTextDocument timed out"
)

# Known formatter and save participant patterns
FORMATTER_PATTERNS=(
    "prettier"
    "eslint"
    "typescript.format"
    "javascript.format"
    "editor.action.format"
    "extension.format"
)

# Save participant history file
SAVE_HISTORY_FILE="$HOME/.vscode-remote/save_participants.json"

analyze_save_hooks() {
    log_section "Analyzing save hooks and formatter performance..."
    local issues_found=false
    local log_dir="$HOME/.vscode-remote/logs"
    
    if [ ! -d "$log_dir" ]; then
        log_success "No log directory found (clean session)"
        return 0
    }
    
    # Statistics tracking
    local total_timeouts=0
    local max_duration=0
    declare -A participant_stats
    declare -A timeout_extensions
    
    # First, check workspace settings
    check_workspace_settings
    
    log_info "Scanning logs for save hook issues..."
    
    # Analyze save timeouts and performance
    while IFS= read -r line; do
        if [[ $line =~ Aborted.*after[[:space:]]+([0-9]+)ms ]]; then
            local duration="${BASH_REMATCH[1]}"
            ((total_timeouts++))
            
            if (( duration > max_duration )); then
                max_duration=$duration
            fi
            
            # Try to identify the extension
            if [[ $line =~ extension\.([a-zA-Z0-9\-\.]+) ]]; then
                local ext="${BASH_REMATCH[1]}"
                ((timeout_extensions[$ext]++))
            fi
            
            track_save_history "$duration" "$ext"
        fi
    done < <(find "$log_dir" -type f -name "*.log" -exec grep -h -E "$(IFS="|"; echo "${SAVE_PATTERNS[*]}")" {} \;)
    
    # Analyze active formatters
    analyze_active_formatters
    
    # Report findings
    if [ $total_timeouts -gt 0 ] || [ ${#participant_stats[@]} -gt 0 ]; then
        issues_found=true
        report_save_hook_analysis "$total_timeouts" "$max_duration"
    else
        log_success "No save hook issues detected"
    fi
    
    return $( [ "$issues_found" = true ] && echo 1 || echo 0)
}

check_workspace_settings() {
    log_info "Checking workspace formatting settings..."
    local vscode_settings="$HOME/.vscode-remote/data/Machine/settings.json"
    local workspace_settings=".vscode/settings.json"
    
    # Check for potentially conflicting settings
    local formatting_settings=(
        "editor.formatOnSave"
        "editor.codeActionsOnSave"
        "editor.formatOnType"
        "files.autoSave"
    )
    
    for setting in "${formatting_settings[@]}"; do
        local workspace_value=""
        local user_value=""
        
        if [ -f "$workspace_settings" ]; then
            workspace_value=$(jq ".[\"$setting\"]" "$workspace_settings" 2>/dev/null)
        fi
        
        if [ -f "$vscode_settings" ]; then
            user_value=$(jq ".[\"$setting\"]" "$vscode_settings" 2>/dev/null)
        fi
        
        if [ -n "$workspace_value" ] && [ -n "$user_value" ] && [ "$workspace_value" != "$user_value" ]; then
            log_warning "Conflicting setting detected: $setting"
            log_warning "- Workspace: $workspace_value"
            log_warning "- User: $user_value"
        fi
    done
}

analyze_active_formatters() {
    log_info "\nAnalyzing active formatters..."
    local formatter_count=0
    
    # Check for known formatters in extensions
    while IFS= read -r line; do
        if [[ $line =~ formatter|linter|prettier|eslint ]]; then
            ((formatter_count++))
            log_info "- Detected formatter: $line"
            
            # Check if this formatter has recent timeouts
            if grep -q "$line.*timeout" "$log_dir"/*.log 2>/dev/null; then
                log_warning "  ⚠️ Recent timeouts detected for this formatter"
            fi
        fi
    done < <(code --list-extensions 2>/dev/null)
    
    if [ $formatter_count -gt 3 ]; then
        log_warning "Multiple formatters detected ($formatter_count). This may cause conflicts or performance issues."
    fi
}

track_save_history() {
    local duration=$1
    local extension=$2
    local timestamp=$(date +%s)
    
    # Create or update history file
    if [ ! -f "$SAVE_HISTORY_FILE" ]; then
        echo '{"history":[]}' > "$SAVE_HISTORY_FILE"
    fi
    
    # Add new entry
    local entry=$(jq -c \
        --arg ts "$timestamp" \
        --arg d "$duration" \
        --arg e "${extension:-unknown}" \
        '.history += [{timestamp: $ts|tonumber, duration: $d|tonumber, extension: $e}]' \
        "$SAVE_HISTORY_FILE")
    
    echo "$entry" > "$SAVE_HISTORY_FILE"
    
    # Keep only last 50 entries
    local trimmed=$(jq '.history |= .[-50:]' "$SAVE_HISTORY_FILE")
    echo "$trimmed" > "$SAVE_HISTORY_FILE"
}

suggest_save_optimizations() {
    local has_suggestions=false
    
    log_info "\nOptimization Suggestions:"
    
    # Check for timeout threshold
    if ! grep -q "codeActionsOnSaveTimeout" ".vscode/settings.json" 2>/dev/null; then
        log_info "- Consider adding 'editor.codeActionsOnSaveTimeout': 3000 to settings"
        has_suggestions=true
    fi
    
    # Check formatter conflicts
    if [ $(jq '.["editor.defaultFormatter"]' .vscode/settings.json 2>/dev/null) == "null" ]; then
        log_info "- Set a default formatter to avoid conflicts"
        has_suggestions=true
    fi
    
    # Suggest based on timeout frequency
    if [ $1 -gt 5 ]; then
        log_warning "- Consider disabling formatOnSave for large files"
        log_warning "- Review and potentially disable some save participants"
        has_suggestions=true
    fi
    
    if ! $has_suggestions; then
        log_info "No specific optimizations needed at this time"
    fi
}

report_save_hook_analysis() {
    local total_timeouts=$1
    local max_duration=$2
    
    log_warning "\nSave Hook Analysis:"
    log_warning "Total save timeouts: $total_timeouts"
    log_warning "Maximum duration: ${max_duration}ms"
    
    # Report per-extension timeouts
    if [ ${#timeout_extensions[@]} -gt 0 ]; then
        log_info "\nTimeout Distribution by Extension:"
        for ext in "${!timeout_extensions[@]}"; do
            log_warning "- $ext: ${timeout_extensions[$ext]} timeouts"
        done
    fi
    
    # Calculate and show trends
    if [ -f "$SAVE_HISTORY_FILE" ]; then
        local avg_duration=$(jq -r '.history[-10:] | map(.duration) | add / length' "$SAVE_HISTORY_FILE")
        log_info "\nRecent Performance:"
        log_info "- Average duration: ${avg_duration}ms"
        
        # Check for trending issues
        if (( $(echo "$max_duration > $avg_duration * 1.5" | bc -l) )); then
            log_warning "Recent save operations showing significant slowdown"
        fi
    fi
    
    suggest_save_optimizations "$total_timeouts"
}

# Run analysis if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    analyze_save_hooks
fi
