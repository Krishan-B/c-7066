#!/bin/bash
# Keychain and authentication health diagnostics

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

check_keychain_health() {
  log_section "Checking keychain and authentication storage health..."
  local issues_found=false
  
  local vscode_storage="$HOME/.vscode-remote/data/User/globalStorage"
  local secrets_storage="$HOME/.vscode-remote/data/User/secrets"
  
  if [ -d "$vscode_storage" ]; then
    if [ -d "$secrets_storage" ]; then
      local secrets_size=$(du -sm "$secrets_storage" 2>/dev/null | cut -f1 || echo "0")
      if [ "$secrets_size" -gt 10 ]; then
        log_warning "Large secrets storage detected (${secrets_size}MB)"
        echo "   This may indicate corrupted or accumulating keychain data"
        issues_found=true
      fi
    fi
    
    for ext in "${KEYCHAIN_DEPENDENT_EXTENSIONS[@]}"; do
      local ext_storage="$vscode_storage/${ext}"
      if [ -d "$ext_storage" ]; then
        if find "$ext_storage" -name "*token*" -o -name "*auth*" -o -name "*cipher*" 2>/dev/null | grep -q .; then
          log_info "Found authentication storage for: $ext"
          
          local recent_files=$(find "$ext_storage" -mmin -5 2>/dev/null | wc -l)
          if [ "$recent_files" -gt 10 ]; then
            log_warning "Many recent file modifications in $ext storage"
            echo "   This may indicate keychain cipher issues or auth loops"
            issues_found=true
          fi
        fi
      fi
    done
  else
    log_warning "VS Code storage directory not found: $vscode_storage"
    echo "   This may indicate a fresh session or storage initialization issues"
    issues_found=true
  fi
  
  if [ -f "$HOME/.vscode-remote/logs/main.log" ]; then
    local keychain_errors=$(grep -c "LocalStorageKeychain\|Failed to get cipher\|keychain.*failed" "$HOME/.vscode-remote/logs/main.log" 2>/dev/null || echo "0")
    if [ "$keychain_errors" -gt 0 ]; then
      log_error "Found $keychain_errors keychain-related errors in logs"
      echo "   Recent keychain failures detected - authentication may be unstable"
      issues_found=true
    fi
  fi
  
  if [ "$issues_found" = false ]; then
    log_success "Keychain and authentication storage appear healthy"
  fi
  
  return 0
}

# --- Main Execution ---
main() {
    init_logging
    check_keychain_health
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
