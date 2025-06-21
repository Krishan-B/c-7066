#!/bin/bash
# Log analysis and signal vs noise detection

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# Log patterns that are informational (not errors)
INFORMATIONAL_LOG_PATTERNS=(
    "Used similarity matching.*confidence"
    "Extension Host.*debug"
    "FileSystemService.*LARGE file"
    "Telemetry.*sent"
    "Language.*activated"
)

# Log patterns that indicate real issues
ERROR_LOG_PATTERNS=(
    "LocalStorageKeychain.*Failed"
    "InstantiationService.*disposed"
    "Cannot read properties of null"
    "Extension.*failed to activate"
    "FATAL.*ERROR"
)

check_log_health() {
  log_section "Analyzing VS Code logs for signal vs noise..."
  local issues_found=false
  local log_dir="$HOME/.vscode-remote/logs"
  
  if [ ! -d "$log_dir" ]; then
    log_success "No log directory found (clean session)"
    return 0
  fi
  
  local recent_log=$(find "$log_dir" -name "*.log" -type f -exec ls -t {} + | head -1)
  
  if [ -z "$recent_log" ]; then
    log_success "No recent log files found"
    return 0
  fi
  
  log_info "Analyzing recent log: $(basename "$recent_log")"
  
  local error_count=0
  local info_count=0
  
  for pattern in "${ERROR_LOG_PATTERNS[@]}"; do
    local matches=$(grep -c "$pattern" "$recent_log" 2>/dev/null || echo "0")
    if [ "$matches" -gt 0 ]; then
      log_error "Found $matches instances of: $pattern"
      error_count=$((error_count + matches))
      issues_found=true
    fi
  done
  
  for pattern in "${INFORMATIONAL_LOG_PATTERNS[@]}"; do
    local matches=$(grep -c "$pattern" "$recent_log" 2>/dev/null || echo "0")
    if [ "$matches" -gt 0 ]; then
      log_info "Found $matches informational messages: $pattern"
      info_count=$((info_count + matches))
    fi
  done
  
  if [ "$error_count" -eq 0 ] && [ "$info_count" -gt 0 ]; then
    log_success "Good signal-to-noise ratio: $info_count informational, $error_count errors"
    echo "   The similarity matching and other messages are normal operation"
  elif [ "$error_count" -gt 0 ]; then
    log_warning "Found $error_count actual errors among $info_count informational messages"
    echo "   Focus on the error patterns above for troubleshooting"
  fi
  
  local log_size_mb=$(du -m "$recent_log" 2>/dev/null | cut -f1)
  if [ "$log_size_mb" -gt 50 ]; then
    log_warning "Large log file detected (${log_size_mb}MB)"
    echo "   Consider clearing logs if VS Code feels slow"
    issues_found=true
  fi
  
  if [ "$issues_found" = false ]; then
    log_success "Log analysis shows healthy VS Code operation"
  fi
  
  return 0
}

# --- Main Execution ---
main() {
    init_logging
    check_log_health
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
