#!/bin/bash
# Copilot similarity matching and intent analysis

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# Confidence thresholds
HIGH_CONFIDENCE=95.0
WARN_CONFIDENCE=85.0
LOW_CONFIDENCE=75.0

# Patterns to track
SIMILARITY_PATTERNS=(
    "Used similarity matching with ([0-9.]+)% confidence"
    "Intent matched.*confidence:.*([0-9.]+)"
    "Fuzzy matched command.*([0-9.]+)%"
    "Alternative command suggestions:"
)

# Common diagnostic commands to monitor
DIAGNOSTIC_COMMANDS=(
    "check extension conflicts"
    "analyze performance"
    "monitor memory usage"
    "scan for errors"
    "validate workspace"
    "inspect logs"
)

# History file for similarity matches
SIMILARITY_HISTORY="$HOME/.vscode-remote/similarity_matches.json"

analyze_similarity_matching() {
    log_section "Analyzing Copilot similarity matching..."
    local issues_found=false
    local log_dir="$HOME/.vscode-remote/logs"
    
    if [ ! -d "$log_dir" ]; then
        log_success "No log directory found (clean session)"
        return 0
    }
    
    # Statistics tracking
    declare -A confidence_levels
    declare -A command_matches
    local total_matches=0
    local low_confidence_matches=0
    
    log_info "Scanning for similarity matching patterns..."
    
    # Analyze similarity matching logs
    while IFS= read -r line; do
        if [[ $line =~ confidence.*([0-9.]+) ]]; then
            local confidence="${BASH_REMATCH[1]}"
            ((total_matches++))
            
            # Track confidence distribution
            if (( $(echo "$confidence >= $HIGH_CONFIDENCE" | bc -l) )); then
                ((confidence_levels["high"]++))
            elif (( $(echo "$confidence >= $WARN_CONFIDENCE" | bc -l) )); then
                ((confidence_levels["medium"]++))
            else
                ((confidence_levels["low"]++))
                ((low_confidence_matches++))
            fi
            
            # Extract matched command if available
            if [[ $line =~ \"(.+?)\".*confidence ]]; then
                local command="${BASH_REMATCH[1]}"
                ((command_matches[$command]++))
            fi
            
            # Track match history
            track_similarity_match "$confidence" "$command"
        fi
    done < <(find "$log_dir" -type f -name "*copilot*.log" -exec grep -h -E "$(IFS="|"; echo "${SIMILARITY_PATTERNS[*]}")" {} \;)
    
    # Analyze command patterns
    analyze_command_patterns
    
    # Report findings
    if [ $total_matches -gt 0 ]; then
        report_similarity_analysis "$total_matches" "$low_confidence_matches"
        if [ $low_confidence_matches -gt 0 ]; then
            issues_found=true
        fi
    else
        log_success "No similarity matching activity detected"
    fi
    
    return $( [ "$issues_found" = true ] && echo 1 || echo 0)
}

track_similarity_match() {
    local confidence=$1
    local command=$2
    local timestamp=$(date +%s)
    
    # Create or update history file
    if [ ! -f "$SIMILARITY_HISTORY" ]; then
        echo '{"matches":[]}' > "$SIMILARITY_HISTORY"
    fi
    
    # Add new entry
    local entry=$(jq -c \
        --arg ts "$timestamp" \
        --arg cf "$confidence" \
        --arg cmd "${command:-unknown}" \
        '.matches += [{timestamp: $ts|tonumber, confidence: $cf|tonumber, command: $cmd}]' \
        "$SIMILARITY_HISTORY")
    
    echo "$entry" > "$SIMILARITY_HISTORY"
    
    # Keep only last 100 entries
    local trimmed=$(jq '.matches |= .[-100:]' "$SIMILARITY_HISTORY")
    echo "$trimmed" > "$SIMILARITY_HISTORY"
}

analyze_command_patterns() {
    log_info "\nAnalyzing command patterns..."
    
    # Check for common diagnostic commands
    for cmd in "${DIAGNOSTIC_COMMANDS[@]}"; do
        local variations=0
        while IFS= read -r line; do
            if [[ $line =~ similarity.*confidence ]]; then
                ((variations++))
            fi
        done < <(find "$log_dir" -type f -name "*copilot*.log" -exec grep -h -i "$cmd" {} \;)
        
        if [ $variations -gt 1 ]; then
            log_warning "Multiple variations detected for command: '$cmd'"
            log_warning "Consider standardizing this command phrase"
        fi
    done
}

suggest_command_improvements() {
    local low_confidence=$1
    local total=$2
    
    if [ $low_confidence -eq 0 ]; then
        return 0
    fi
    
    local low_confidence_ratio=$(echo "scale=2; $low_confidence / $total" | bc)
    
    log_info "\nCommand Improvement Suggestions:"
    
    if (( $(echo "$low_confidence_ratio > 0.2" | bc -l) )); then
        log_warning "High rate of low-confidence matches detected!"
        log_warning "Consider the following improvements:"
        log_info "1. Use more specific command phrases"
        log_info "2. Avoid ambiguous terms"
        log_info "3. Standardize common command patterns"
        
        # Analyze specific patterns
        if [ -f "$SIMILARITY_HISTORY" ]; then
            log_info "\nProblematic Command Patterns:"
            jq -r '.matches | map(select(.confidence < 85)) | group_by(.command) | .[] | .[0].command' "$SIMILARITY_HISTORY" | \
            while read -r cmd; do
                if [ "$cmd" != "unknown" ]; then
                    log_warning "- '$cmd' frequently has low confidence"
                fi
            done
        fi
    fi
}

report_similarity_analysis() {
    local total_matches=$1
    local low_confidence_matches=$2
    
    log_warning "\nSimilarity Matching Analysis:"
    log_warning "Total matches analyzed: $total_matches"
    
    # Report confidence distribution
    log_info "\nConfidence Distribution:"
    for level in "${!confidence_levels[@]}"; do
        local count=${confidence_levels[$level]}
        local percentage=$(echo "scale=2; $count * 100 / $total_matches" | bc)
        log_info "- $level confidence: $count ($percentage%)"
    done
    
    # Report command patterns
    if [ ${#command_matches[@]} -gt 0 ]; then
        log_info "\nMost Common Commands:"
        for cmd in "${!command_matches[@]}"; do
            log_info "- '$cmd': ${command_matches[$cmd]} matches"
        done
    fi
    
    # Calculate and show trends
    if [ -f "$SIMILARITY_HISTORY" ]; then
        local avg_confidence=$(jq -r '.matches[-20:] | map(.confidence) | add / length' "$SIMILARITY_HISTORY")
        log_info "\nRecent Performance:"
        log_info "- Average confidence: ${avg_confidence}%"
    fi
    
    suggest_command_improvements "$low_confidence_matches" "$total_matches"
}

# Run analysis if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    analyze_similarity_matching
fi
