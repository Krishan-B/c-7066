#!/bin/bash

echo "🔧 Configuring VS Code workspace settings for Trade-Pro CFD Trading Platform..."

# Create/update workspace settings for optimal performance
WORKSPACE_SETTINGS='{
  "npm.packageManager": "bun",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\\\(([^)]*)\\\\)", "[\"\\'\`]([^\"\\'\`]*).*?[\"\\'\`]"],
    ["cx\\\\(([^)]*)\\\\)", "(?:\\'\|\\\")([^\\'\\\"]*)(?:\\'\|\\\")"]
  ],
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescriptreact": "html",
    "javascriptreact": "html"
  },
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false,
    "markdown": true,
    "typescript": true,
    "typescriptreact": true,
    "javascript": true,
    "javascriptreact": true
  },
  "github.copilot.editor.enableAutoCompletions": true,
  "supabase.showUntitledDocuments": false,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
  "editor.inlineSuggest.enabled": true,
  "editor.accessibilitySupport": "off",
  "extensions.ignoreRecommendations": true,
  "workbench.settings.enableNaturalLanguageSearch": false,
  "search.exclude": {
    "**/node_modules": true,
    "**/bun.lockb": true,
    "**/dist": true,
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/tmp": true,
    "**/coverage": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/tmp": true,
    "**/node_modules": true,
    "**/coverage": true
  }
}'

# Ensure .vscode directory exists
mkdir -p .vscode

# Write settings
echo "$WORKSPACE_SETTINGS" > .vscode/settings.json

echo "✅ Workspace settings configured!"

# Create recommended extensions file
EXTENSIONS_JSON='{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode", 
    "bradlc.vscode-tailwindcss-intellisense",
    "supabase.vscode-supabase-extension",
    "github.copilot",
    "github.copilot-chat",
    "ms-vscode.vscode-typescript-next"
  ],
  "unwantedRecommendations": [
    "formulahendry.code-runner",
    "blackboxapp.blackbox",
    "tabnine.tabnine-vscode",
    "codeium.codeium",
    "ms-python.python",
    "ms-toolsai.jupyter",
    "redhat.java"
  ]
}'

echo "$EXTENSIONS_JSON" > .vscode/extensions.json

echo "✅ Extensions recommendations configured!"

echo "🎯 Configuration Summary:"
echo "  📁 .vscode/settings.json - Workspace settings optimized for trading platform"
echo "  📦 .vscode/extensions.json - Recommended/unwanted extensions defined"
echo "  🔧 Formatter: Prettier (default for all file types)"
echo "  🎨 CSS Framework: Tailwind CSS IntelliSense enabled"
echo "  🤖 AI Assistant: GitHub Copilot optimized"
echo "  📊 Database: Supabase integration configured"
echo ""
echo "📝 Please reload VS Code to apply all settings!"
