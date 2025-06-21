#!/bin/bash
# Workspace configuration validator and model initialization checker

source "$(dirname "${BASH_SOURCE[0]}")/core.sh"

# VS Code config files to check
CONFIG_FILES=(
    ".vscode/settings.json"
    ".vscode/launch.json"
    ".vscode/tasks.json"
    ".vscode/extensions.json"
    "devcontainer.json"
    ".devcontainer/devcontainer.json"
)

# Patterns that might reference files
FILE_REFERENCE_PATTERNS=(
    '"path":'
    '"program":'
    '"file":'
    '"source":'
    '"uri":'
    '"cwd":'
    '"rootPath":'
    '"workspaceFolder":'
    '"default":'
)

analyze_workspace_config() {
    log_section "Analyzing workspace configuration and file references..."
    local issues_found=false
    local workspace_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
    
    # Track statistics
    local broken_refs=0
    local suspicious_patterns=0
    declare -A file_issues
    
    # First check if we're in a workspace
    if [ ! -d "$workspace_root/.vscode" ]; then
        log_info "No .vscode directory found. Skipping workspace config analysis."
        return 0
    }
    
    # Analyze each config file
    for config in "${CONFIG_FILES[@]}"; do
        local config_path="$workspace_root/$config"
        if [ -f "$config_path" ]; then
            log_info "Checking $config..."
            
            # Validate JSON syntax first
            if ! jq empty "$config_path" 2>/dev/null; then
                log_error "Invalid JSON syntax in $config"
                issues_found=true
                continue
            }
            
            # Extract and validate file references
            while IFS= read -r line; do
                if [[ $line =~ \"(.+?)\" ]]; then
                    local file_ref="${BASH_REMATCH[1]}"
                    # Expand variables and normalize path
                    file_ref=$(eval echo "$file_ref" 2>/dev/null || echo "$file_ref")
                    
                    # Handle relative paths
                    if [[ ! "$file_ref" = /* ]] && [[ ! "$file_ref" =~ ^[a-zA-Z]: ]]; then
                        file_ref="$workspace_root/$file_ref"
                    fi
                    
                    # Check if file exists (ignore URIs and env vars)
                    if [[ ! "$file_ref" =~ ^(https?|vscode|git|env): ]] && [ ! -e "$file_ref" ]; then
                        ((broken_refs++))
                        file_issues["$config"]+="- Missing file: $file_ref\n"
                        issues_found=true
                    fi
                fi
            done < <(jq -r 'paths(scalars) as $p | select(getpath($p) | tostring | test("\\.(js|json|txt|md|sh|py|tsx?|jsx?)$")) | getpath($p)' "$config_path" 2>/dev/null)
        fi
    done
    
    # Check for suspicious patterns that might cause model initialization issues
    check_model_init_risks
    
    # Report findings
    if [ $broken_refs -gt 0 ] || [ $suspicious_patterns -gt 0 ]; then
        log_warning "\nConfiguration Analysis Results:"
        log_warning "- Broken file references: $broken_refs"
        log_warning "- Suspicious patterns: $suspicious_patterns"
        
        # Report per-file issues
        for config in "${!file_issues[@]}"; do
            log_warning "\nIssues in $config:"
            echo -e "${file_issues[$config]}"
        done
        
        generate_recommendations
    else
        log_success "No configuration issues detected"
    fi
    
    check_dotfile_health
    
    return $( [ "$issues_found" = true ] && echo 1 || echo 0)
}

check_model_init_risks() {
    log_info "\nChecking for potential model initialization risks..."
    local risk_count=0
    
    # Common patterns that might cause model initialization issues
    local risk_patterns=(
        'onDidChange.*undefined'
        'createModel.*failed'
        'ModelService.*error'
        'EditorModel.*disposed'
        'Invalid text model'
    )
    
    # Check VS Code logs for model-related errors
    while IFS= read -r line; do
        ((risk_count++))
        if [ "$risk_count" -eq 1 ]; then
            log_warning "\nDetected model initialization risks:"
        fi
        log_warning "- $line"
    done < <(find "$HOME/.vscode-remote/logs" -type f -name "*.log" -exec grep -h -E "$(IFS="|"; echo "${risk_patterns[*]}")" {} \; 2>/dev/null)
    
    ((suspicious_patterns += risk_count))
}

check_dotfile_health() {
    log_info "\nChecking dotfile configuration..."
    local dotfiles=(
        ".bashrc"
        ".bash_profile"
        ".profile"
        ".zshrc"
        ".gitconfig"
    )
    
    for dotfile in "${dotfiles[@]}"; do
        if [ -f "$HOME/$dotfile" ]; then
            # Check for VS Code related customizations
            if grep -q "VSCODE\|code\|vsls" "$HOME/$dotfile" 2>/dev/null; then
                log_info "Found VS Code customizations in $dotfile"
                validate_dotfile_refs "$HOME/$dotfile"
            fi
        fi
    done
}

validate_dotfile_refs() {
    local dotfile="$1"
    local invalid_refs=0
    
    while IFS= read -r line; do
        if [[ $line =~ (\/[^[:space:]\"\']+\.[^[:space:]\"\']+) ]]; then
            local file_ref="${BASH_REMATCH[1]}"
            if [ ! -e "$file_ref" ]; then
                ((invalid_refs++))
                log_warning "- Invalid reference in $dotfile: $file_ref"
            fi
        fi
    done < "$dotfile"
    
    if [ $invalid_refs -gt 0 ]; then
        issues_found=true
    fi
}

generate_recommendations() {
    log_info "\nRecommendations:"
    
    if [ $broken_refs -gt 0 ]; then
        log_warning "1. Fix or remove broken file references in workspace configs"
        log_warning "2. Update paths to reflect current project structure"
        log_warning "3. Consider using workspace-relative paths where possible"
    fi
    
    if [ $suspicious_patterns -gt 0 ]; then
        log_warning "4. Run 'Reload Window' to reset editor state"
        log_warning "5. Check extension activation events"
        log_warning "6. Review auto-opened files in workspace settings"
    fi
    
    log_info "\nPreventive Measures:"
    log_info "- Keep workspace configs in version control"
    log_info "- Use relative paths when possible"
    log_info "- Regularly audit file references"
}

# Run analysis if script is executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    analyze_workspace_config
fi
