#!/bin/bash
# Headers security analysis wrapper for JS/TS diagnostic tool

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

check_headers_health() {
    log_section "Analyzing header usage across JS/TS files..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required for headers analysis but not found"
        return 1
    }
    
    # Run the JS-based analysis tool
    local analysis_output
    if ! analysis_output=$(node "$(dirname "${BASH_SOURCE[0]}")/headers.js" 2>&1); then
        log_warning "Potential header issues found:"
        echo "$analysis_output"
        return 1
    else
        log_success "No unsafe header usage detected"
        return 0
    fi
}

# Run analysis if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    check_headers_health
fi
