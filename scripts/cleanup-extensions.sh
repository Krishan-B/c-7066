#!/bin/bash

echo "🧹 Cleaning up unnecessary extensions for Trade-Pro CFD Trading Platform..."

# Extensions that can cause performance issues or conflicts
POTENTIALLY_PROBLEMATIC=(
    "formulahendry.code-runner"          # Can slow down VS Code
    "blackboxapp.blackbox"               # Duplicate AI functionality  
    "blackboxapp.blackboxagent"          # Duplicate AI functionality
    "tabnine.tabnine-vscode"             # Conflicts with Copilot
    "codeium.codeium"                    # Conflicts with Copilot
    "codium.codium"                      # Conflicts with Copilot
    "ms-python.python"                   # Not needed for React/TS project
    "ms-toolsai.jupyter"                 # Not needed for trading platform
    "redhat.java"                        # Not needed for React/TS project
    "vscjava.vscode-java-pack"           # Not needed for React/TS project
    "ms-dotnettools.csharp"              # Not needed for React/TS project
    "rust-lang.rust-analyzer"            # Not needed for React/TS project
)

# Extensions that might be unnecessary depending on workflow
OPTIONAL_EVALUATE=(
    "ms-playwright.playwright"           # Only if not doing E2E testing
    "ms-vscode.references-view"          # Basic functionality covered by TS
    "ms-vscode.remote-containers"        # Only if not using containers
    "ms-vscode.remote-ssh"               # Only if not using remote development
    "ms-vscode.remote-wsl"               # Only if not using WSL
    "eamodio.gitlens"                    # Heavy extension, evaluate if needed
)

# Extensions to disable/uninstall
DISABLE_EXTENSIONS=(
    "ms-vscode.vscode-typescript-next"  # Nightly builds not required
    "yzhang.markdown-all-in-one"       # Markdown extension not heavily used
    "github.github-vscode-theme"      # Optional aesthetic extension
    "ms-vsliveshare.vsliveshare"       # Can cause instability/conflicts
    # Removed GitHub Codespaces from disable list as it's essential for Codespaces
)

# Remote extensions that can cause conflicts in Codespaces
CODESPACE_CONFLICTS=(
    "ms-vscode.remote-repositories"      # Conflicts in Codespaces
    "ms-vscode.remote-tunnels"           # Conflicts in Codespaces
    "ms-vscode-remote.remote-containers" # Redundant in Codespaces
    "ms-vscode-remote.remote-ssh"        # Not needed in Codespaces
    "ms-vscode-remote.remote-wsl"        # Not needed in Codespaces
)

echo "🔍 Checking for potentially problematic extensions..."

for extension in "${POTENTIALLY_PROBLEMATIC[@]}"; do
    if code --list-extensions | grep -q "$extension"; then
        echo "⚠️  Found potentially problematic extension: $extension"
        read -p "Do you want to uninstall $extension? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            echo "🗑️  Uninstalling $extension..."
            code --uninstall-extension "$extension"
            echo "✅ Uninstalled $extension"
        else
            echo "⏭️  Keeping $extension..."
        fi
    fi
done

echo ""
echo "🔍 Checking extensions that might be unnecessary for your trading platform..."

for extension in "${OPTIONAL_EVALUATE[@]}"; do
    if code --list-extensions | grep -q "$extension"; then
        echo "❓ Found optional extension: $extension"
        read -p "Do you want to uninstall $extension? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🗑️  Uninstalling $extension..."
            code --uninstall-extension "$extension"
            echo "✅ Uninstalled $extension"
        else
            echo "⏭️  Keeping $extension..."
        fi
    fi
done

echo ""
echo "🔍 Disabling/uninstalling unnecessary extensions..."

for extension in "${DISABLE_EXTENSIONS[@]}"; do
    if code --list-extensions | grep -q "$extension"; then
        echo "🗑️  Uninstalling $extension..."
        code --uninstall-extension "$extension"
        echo "✅ Uninstalled $extension"
    fi
done

# Performance optimization for Codespaces
echo "🔍 Optimizing extensions for Codespaces..."
for extension in "github.vscode-pull-request-github"; do
    if code --list-extensions | grep -q "$extension"; then
        echo "⚠️  Found extension that may impact performance: $extension"
        read -p "Do you want to disable $extension? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            echo "🗑️  Disabling $extension..."
            code --disable-extension "$extension"
            echo "✅ Disabled $extension"
        fi
    fi
done

echo ""
echo "🔍 Checking for extensions that conflict with Codespaces..."
for extension in "${CODESPACE_CONFLICTS[@]}"; do
    if code --list-extensions | grep -q "$extension"; then
        echo "⚠️  Found extension that conflicts with Codespaces: $extension"
        echo "🗑️  Uninstalling $extension automatically..."
        code --uninstall-extension "$extension"
        echo "✅ Uninstalled $extension"
    fi
done

echo ""
echo "✅ Extension cleanup completed!"
echo ""

# Show current extensions with recommendations
echo "📋 Currently installed extensions:"
echo "======================================="

CURRENT_EXTENSIONS=$(code --list-extensions)

# Core trading platform extensions
echo ""
echo "🎯 ESSENTIAL FOR TRADING PLATFORM:"
echo "  ✅ ESLint" && echo "$CURRENT_EXTENSIONS" | grep -q "dbaeumer.vscode-eslint" && echo "     ✅ Installed" || echo "     ❌ Missing"
echo "  ✅ Prettier" && echo "$CURRENT_EXTENSIONS" | grep -q "esbenp.prettier-vscode" && echo "     ✅ Installed" || echo "     ❌ Missing"
echo "  ✅ Tailwind CSS" && echo "$CURRENT_EXTENSIONS" | grep -q "bradlc.vscode-tailwindcss-intellisense" && echo "     ✅ Installed" || echo "     ❌ Missing"
echo "  ✅ Supabase" && echo "$CURRENT_EXTENSIONS" | grep -q "supabase.vscode-supabase-extension" && echo "     ✅ Installed" || echo "     ❌ Missing"
echo "  ✅ GitHub Copilot" && echo "$CURRENT_EXTENSIONS" | grep -q "github.copilot" && echo "     ✅ Installed" || echo "     ❌ Missing"
echo "  ✅ TypeScript" && echo "$CURRENT_EXTENSIONS" | grep -q "ms-vscode.vscode-typescript-next" && echo "     ✅ Installed" || echo "     ❌ Missing"

echo ""
echo "💡 Run 'bun run extensions:install' to install missing essential extensions."

echo ""
echo "🎉 Cleanup completed! Restart VS Code for changes to take effect."
