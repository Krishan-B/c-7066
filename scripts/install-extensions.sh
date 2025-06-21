#!/bin/bash

echo "🚀 Installing essential extensions for Trade-Pro CFD Trading Platform..."

# Core Essential Extensions for Trading Platform
ESSENTIAL_EXTENSIONS=(
    "dbaeumer.vscode-eslint"                    # ESLint - Code quality
    "esbenp.prettier-vscode"                    # Prettier - Code formatting
    "bradlc.vscode-tailwindcss-intellisense"   # Tailwind CSS IntelliSense
    "github.copilot"                           # GitHub Copilot
    "github.copilot-chat"                      # GitHub Copilot Chat
    "vscode-icons-team.vscode-icons"           # VSCode Icons
)

# Performance & Quality Extensions (Optional)
OPTIONAL_EXTENSIONS=(
    "formulahendry.auto-rename-tag"            # Auto rename paired HTML/JSX tags
    "christian-kohler.path-intellisense"       # Path intellisense
    "gruntfuggly.todo-tree"                    # TODO/FIXME tracker
    "streetsidesoftware.code-spell-checker"    # Spell checker (optional)
)

echo "📦 Installing core essential extensions in parallel..."
pids=()
for extension in "${ESSENTIAL_EXTENSIONS[@]}"; do
    (
        echo "Installing: $extension"
        if ! code --install-extension "$extension" --force; then
            echo "❌ Failed to install essential extension: $extension" >&2
        fi
    ) &
    pids+=($!)
done

# Wait for all background jobs to finish
echo "⏳ Waiting for essential installations to complete..."
wait "${pids[@]}"
echo "✅ Core essential extensions installation process finished."


echo "🔌 Installing optional productivity extensions..."
for extension in "${OPTIONAL_EXTENSIONS[@]}"; do
    if ! code --list-extensions | grep -q "$extension"; then
        read -p "Install $extension? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            echo "Installing: $extension"
            if ! code --install-extension "$extension" --force; then
                echo "❌ Failed to install optional extension: $extension" >&2
            fi
        else
            echo "Skipping: $extension"
        fi
    else
        echo "Already installed: $extension"
    fi
done

echo "✅ All extension installations attempted."

# Check installed extensions
echo "📋 Verifying installed extensions..."
echo "Core Extensions:"
for extension in "${ESSENTIAL_EXTENSIONS[@]}"; do
    if code --list-extensions | grep -q "$extension"; then
        echo "  ✅ $extension"
    else
        echo "  ❌ $extension (failed to install)"
    fi
done

echo "🔧 Extensions installation completed!"
echo "📝 Please reload VS Code to ensure all extensions are properly activated."
echo "💡 Run 'bun run extensions:cleanup' to remove potentially conflicting extensions."
