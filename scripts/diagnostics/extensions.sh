#!/bin/bash
# Extension health and conflict detection

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

check_extension_conflicts() {
  log_section "Checking for potentially problematic extensions..."
  local issues_found=false
  
  if ! command_exists code; then
    log_warning "'code' command not available - skipping extension check"
    return 0
  fi
  
  local installed_extensions=$(code --list-extensions 2>/dev/null || echo "")
  
  for pattern in "${PROBLEMATIC_EXTENSIONS[@]}"; do
    if echo "$installed_extensions" | grep -qi "${pattern%\*}"; then
      log_error "Found potentially problematic extension matching: $pattern"
      issues_found=true
    fi
  done
  
  if echo "$installed_extensions" | grep -qi "liveshare"; then
    log_warning "Live Share extensions detected - these can cause disposal issues in web environments"
    issues_found=true
  fi
  
  log_section "Checking for extensions prone to InstantiationService disposal issues..."
  for pattern in "${DISPOSAL_PRONE_EXTENSIONS[@]}"; do
    local clean_pattern="${pattern%\*}"
    clean_pattern="${clean_pattern#\*}"
    if echo "$installed_extensions" | grep -qi "$clean_pattern"; then
      log_warning "Found disposal-prone extension pattern: $pattern"
      echo "   These extensions may cause 'InstantiationService has been disposed' errors"
      issues_found=true
    fi
  done
  
  log_section "Checking for extensions that depend on keychain/authentication..."
  for ext in "${KEYCHAIN_DEPENDENT_EXTENSIONS[@]}"; do
    if echo "$installed_extensions" | grep -qi "${ext}"; then
      log_info "Found keychain-dependent extension: $ext"
      echo "   If experiencing auth issues, try disabling this extension temporarily"
    fi
  done
  
  if [ "$issues_found" = false ]; then
    log_success "No obviously problematic extensions detected"
  fi
  
  return 0
}

# --- Main Execution ---
main() {
    init_logging
    check_extension_conflicts
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
