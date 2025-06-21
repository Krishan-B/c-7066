#!/bin/bash
set -euo pipefail

# Script to lint all JSON and JSONC files in the workspace to ensure they are well-formed.

# --- Health Check Functions ---

# Checks if a given command exists in the shell's path.
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# --- Main Execution ---

main() {
  echo "🚀 Starting JSON configuration linting..."

  if ! command_exists jq; then
    echo "❌ Error: jq is not installed or not in your PATH."
    echo "💡 Please install jq to run this script. On Debian/Ubuntu: sudo apt-get install jq"
    exit 1
  fi

  echo "🔎 Finding all .json and .jsonc files in the workspace..."
  # Find all json/jsonc files, excluding node_modules and .git
  files_to_check=$(find . -path ./node_modules -prune -o -path ./.git -prune -o -name "*.json" -print -o -name "*.jsonc" -print)

  if [ -z "$files_to_check" ]; then
    echo "🤷 No JSON files found to lint."
    exit 0
  fi

  local all_files_valid=true

  for file in $files_to_check; do
    echo "- Linting '$file'..."
    # Check if file contains comments (indicating JSONC format)
    if grep -q "^\s*//" "$file" || grep -q "/\*" "$file" || [[ "$file" == *.jsonc ]]; then
      # For JSONC files, we need to strip comments before passing to jq
      # Remove single-line comments and multi-line comments
      if cat "$file" | sed 's#//.*$##g' | sed 's#/\*.*\*/##g' | jq -e . >/dev/null 2>&1; then
        echo "  ✅ '$file' is valid JSONC."
      else
        echo "  ❌ Error: '$file' contains invalid JSONC syntax."
        all_files_valid=false
      fi
    else
      # Standard JSON validation
      if jq -e . "$file" >/dev/null 2>&1; then
        echo "  ✅ '$file' is valid JSON."
      else
        echo "  ❌ Error: '$file' contains invalid JSON syntax."
        all_files_valid=false
      fi
    fi
  done

  if [ "$all_files_valid" = false ]; then
    echo "⚠️ Linting failed. One or more JSON files have syntax errors."
    exit 1
  else
    echo "🎉 All JSON configuration files are valid!"
    exit 0
  fi
}

main
