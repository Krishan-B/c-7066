#!/bin/bash
# Cache health and performance monitoring

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# Cache files that commonly grow large and cause performance issues
PROBLEMATIC_CACHE_FILES=(
    "~/.vscode-remote/data/User/globalStorage/github.copilot-chat/commandEmbeddings.json"
    "~/.vscode-remote/data/User/globalStorage/github.copilot/completions.json"
    "~/.vscode-remote/data/User/workspaceStorage"
    "~/.vscode-remote/logs"
    "~/.vscode/extensions/.obsolete"
)

check_cache_health() {
  log_section "Checking extension cache files for performance issues..."
  local issues_found=false
  
  for cache_path in "${PROBLEMATIC_CACHE_FILES[@]}"; do
    local expanded_path="${cache_path/#\~/$HOME}"
    
    if [ -f "$expanded_path" ]; then
      local size_mb=$(get_file_size_mb "$expanded_path")
      
      if [ "$size_mb" -gt "$VERY_LARGE_FILE_THRESHOLD_MB" ]; then
        log_error "VERY LARGE cache file: $cache_path (${size_mb}MB > ${VERY_LARGE_FILE_THRESHOLD_MB}MB)"
        echo "   This file is likely causing performance issues and should be cleaned up"
        issues_found=true
      elif [ "$size_mb" -gt "$LARGE_FILE_THRESHOLD_MB" ]; then
        log_warning "Large cache file: $cache_path (${size_mb}MB > ${LARGE_FILE_THRESHOLD_MB}MB)"
        echo "   Consider cleaning this file if you experience slowdowns"
        issues_found=true
      fi
    elif [ -d "$expanded_path" ]; then
      local dir_size_mb=$(du -sm "$expanded_path" 2>/dev/null | cut -f1 || echo "0")
      
      if [ "$dir_size_mb" -gt "$VERY_LARGE_FILE_THRESHOLD_MB" ]; then
        log_error "VERY LARGE cache directory: $cache_path (${dir_size_mb}MB > ${VERY_LARGE_FILE_THRESHOLD_MB}MB)"
        echo "   This directory is likely causing performance issues"
        issues_found=true
      elif [ "$dir_size_mb" -gt "$LARGE_FILE_THRESHOLD_MB" ]; then
        log_warning "Large cache directory: $cache_path (${dir_size_mb}MB > ${LARGE_FILE_THRESHOLD_MB}MB)"
        echo "   Consider cleaning old files in this directory"
        issues_found=true
      fi
    fi
  done
  
  # Check for GitHub Copilot specific issues
  local copilot_embeddings="$HOME/.vscode-remote/data/User/globalStorage/github.copilot-chat/commandEmbeddings.json"
  if [ -f "$copilot_embeddings" ]; then
    local size_mb=$(get_file_size_mb "$copilot_embeddings")
    if [ "$size_mb" -gt "$LARGE_FILE_THRESHOLD_MB" ]; then
      log_info "GitHub Copilot embeddings cache is large (${size_mb}MB)"
      echo "   You can safely delete this file - Copilot will regenerate it"
      echo "   Command: rm '$copilot_embeddings'"
      issues_found=true
    fi
  fi
  
  # Check for excessive log files
  local log_dir="$HOME/.vscode-remote/logs"
  if [ -d "$log_dir" ]; then
    local old_logs=$(find "$log_dir" -name "*.log" -mtime +7 2>/dev/null | wc -l)
    if [ "$old_logs" -gt 10 ]; then
      log_warning "Found $old_logs old log files (>7 days) in VS Code logs"
      echo "   Consider cleaning old logs: find '$log_dir' -name '*.log' -mtime +7 -delete"
      issues_found=true
    fi
  fi
  
  if [ "$issues_found" = false ]; then
    log_success "Extension cache files appear healthy"
  fi
  
  return 0
}

# --- Main Execution ---
main() {
    init_logging
    check_cache_health
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
