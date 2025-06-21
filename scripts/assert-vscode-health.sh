#!/bin/bash
set -euo pipefail

# Script to assert the health of the VS Code environment by checking for essential extensions.

# --- Configuration ---
# An array of essential extension IDs that must be installed.
# This list should be kept in sync with scripts/install-extensions.sh
ESSENTIAL_EXTENSIONS=(
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "bradlc.vscode-tailwindcss-intellisense"
    "github.copilot"
    "github.copilot-chat"
    "vscode-icons-team.vscode-icons"
)

# --- Health Check Functions ---

# Checks if a given command exists in the shell's path.
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# --- Main Execution ---

main() {
  echo "🚀 Starting VS Code environment health check..."

  if ! command_exists code; then
    echo "❌ Error: 'code' command is not available. This script must be run in a VS Code environment (like Codespaces)."
    exit 1
  fi

  echo "🔎 Verifying that essential extensions are installed..."
  local all_extensions_installed=true
  local installed_extensions=$(code --list-extensions)

  for extension in "${ESSENTIAL_EXTENSIONS[@]}"; do
    if ! echo "$installed_extensions" | grep -qi "$extension"; then
      echo "❌ Error: Required extension '$extension' is not installed."
      all_extensions_installed=false
    else
      echo "✅ Extension '$extension' is installed."
    fi
  done

  if [ "$all_extensions_installed" = false ]; then
    echo "⚠️ Health check failed. Not all essential extensions are installed."
    echo "💡 Please run 'bash scripts/install-extensions.sh' to install them."
    exit 1
  else
    echo "🎉 VS Code environment health check passed successfully!"
    exit 0
  fi
}

main
