# VS Code Extensions Configuration Script for Trade-Pro

## Overview

This document provides the complete configuration and verification scripts for all 14 essential VS Code extensions optimized for Trade-Pro development.

## 🚀 Quick Start Commands

### Extension Installation Verification

```bash
# Verify all 14 extensions are installed
code --list-extensions | grep -E "(usernamehw\.errorlens|dbaeumer\.vscode-eslint|github\.copilot|github\.copilot-chat|ms-vscode\.vscode-typescript-next|yzhang\.markdown-all-in-one|davidanson\.vscode-markdownlint|ms-playwright\.playwright|ms-ossdata\.vscode-postgresql|esbenp\.prettier-vscode|bradlc\.vscode-tailwindcss|vitest\.explorer|aaron-bond\.better-comments|streetsidesoftware\.code-spell-checker)"
```

### Configuration Validation

```bash
# Check VS Code settings syntax
code --check-syntax .vscode/settings.json

# Validate configuration
npm run lint:vscode
```

## 📋 Extension Checklist & Status

### ✅ Core Development Extensions

- [x] **Error Lens** (`usernamehw.errorlens`) - Inline error display
- [x] **ESLint** (`dbaeumer.vscode-eslint`) - Code linting
- [x] **GitHub Copilot** (`github.copilot`) - AI code assistance
- [x] **GitHub Copilot Chat** (`github.copilot-chat`) - AI chat assistance
- [x] **TypeScript Nightly** (`ms-vscode.vscode-typescript-next`) - Latest TypeScript

### ✅ Documentation Extensions

- [x] **Markdown All in One** (`yzhang.markdown-all-in-one`) - Markdown editing
- [x] **Markdownlint** (`davidanson.vscode-markdownlint`) - Markdown linting

### ✅ Testing Extensions

- [x] **Playwright Test** (`ms-playwright.playwright`) - E2E testing
- [x] **Vitest** (`vitest.explorer`) - Unit testing

### ✅ Database Extensions

- [x] **PostgreSQL** (`ms-ossdata.vscode-postgresql`) - Database support

### ✅ Formatting Extensions

- [x] **Prettier** (`esbenp.prettier-vscode`) - Code formatting
- [x] **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - CSS utilities

### ✅ Code Quality Extensions

- [x] **Better Comments** (`aaron-bond.better-comments`) - Enhanced comments
- [x] **Code Spell Checker** (`streetsidesoftware.code-spell-checker`) - Spell checking

## 🔧 Configuration Details

### 1. Error Lens Configuration

```json
{
  "errorLens.enabled": true,
  "errorLens.enabledDiagnosticLevels": ["error", "warning"],
  "errorLens.delay": 500,
  "errorLens.onSave": true,
  "errorLens.followCursor": "closestProblem",
  "errorLens.gutterIconsEnabled": true,
  "errorLens.statusBarIconsEnabled": true
}
```

### 2. ESLint Configuration

```json
{
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.useFlatConfig": true,
  "eslint.run": "onSave",
  "eslint.format.enable": false
}
```

### 3. GitHub Copilot Configuration

```json
{
  "github.copilot.enable": {
    "*": true,
    "typescript": true,
    "typescriptreact": true,
    "javascript": true,
    "javascriptreact": true
  },
  "github.copilot.chat.enabled": true,
  "github.copilot.editor.enableCodeActions": true
}
```

### 4. TypeScript Configuration

```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "prompt",
  "typescript.preferences.reactjsxruntime": "react-jsx"
}
```

### 5. Prettier Configuration

```json
{
  "prettier.enable": true,
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 6. Tailwind CSS Configuration

```json
{
  "tailwindCSS.validate": true,
  "tailwindCSS.colorDecorators": true,
  "tailwindCSS.suggestions": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 7. Vitest Configuration

```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npx vitest",
  "vitest.workspaceConfig": "./vitest.config.ts",
  "vitest.debuggerAutoAttach": "smart"
}
```

### 8. Playwright Configuration

```json
{
  "playwright.reuseBrowser": true,
  "playwright.runInBand": false,
  "playwright.showTrace": true
}
```

### 9. Code Spell Checker Configuration

```json
{
  "cSpell.enabled": true,
  "cSpell.enabledFileTypes": {
    "typescript": true,
    "typescriptreact": true,
    "javascript": true,
    "markdown": true
  },
  "cSpell.words": ["tradepro", "supabase", "tailwindcss", "vite", "vitest"]
}
```

## 🚀 Performance Optimizations

### Memory Usage Optimization

```json
{
  "typescript.tsserver.maxTsServerMemory": 2048,
  "typescript.tsserver.maxTsServerProcesses": 1,
  "extensions.experimental.useUtilityProcess": true
}
```

### File Watching Optimization

```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/coverage": true,
    "**/.eslintcache": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  }
}
```

## 🔧 Troubleshooting Commands

### Fix GitHub Copilot Chat Issues

```bash
# Reload VS Code window
Ctrl+Shift+P > "Developer: Reload Window"

# Check Copilot authentication
Ctrl+Shift+P > "GitHub Copilot: Sign In"

# Reset Copilot Chat
Ctrl+Shift+P > "GitHub Copilot Chat: Reset Session"
```

### Fix Database Tool Validation

```bash
# Clear PostgreSQL cache
Ctrl+Shift+P > "PostgreSQL: Clear Cache"

# Reload database connections
Ctrl+Shift+P > "PostgreSQL: Refresh Explorer"
```

### Fix ESLint Issues

```bash
# Clear ESLint cache
rm -f .eslintcache

# Restart ESLint server
Ctrl+Shift+P > "ESLint: Restart ESLint Server"
```

### Fix TypeScript Issues

```bash
# Restart TypeScript server
Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Clear TypeScript cache
Ctrl+Shift+P > "TypeScript: Reset Project"
```

## 📝 Package.json Scripts for Extension Management

```json
{
  "scripts": {
    "ext:install": "code --install-extension usernamehw.errorlens && code --install-extension dbaeumer.vscode-eslint && code --install-extension github.copilot && code --install-extension github.copilot-chat && code --install-extension ms-vscode.vscode-typescript-next && code --install-extension yzhang.markdown-all-in-one && code --install-extension davidanson.vscode-markdownlint && code --install-extension ms-playwright.playwright && code --install-extension ms-ossdata.vscode-postgresql && code --install-extension esbenp.prettier-vscode && code --install-extension bradlc.vscode-tailwindcss && code --install-extension vitest.explorer && code --install-extension aaron-bond.better-comments && code --install-extension streetsidesoftware.code-spell-checker",
    "ext:list": "code --list-extensions | grep -E '(usernamehw|dbaeumer|github|ms-vscode|yzhang|davidanson|ms-playwright|ms-ossdata|esbenp|bradlc|vitest|aaron-bond|streetsidesoftware)'",
    "ext:validate": "node scripts/validate-extensions.js",
    "lint:vscode": "jsonlint .vscode/settings.json && jsonlint .vscode/extensions.json"
  }
}
```

## 🎯 Success Criteria

### ✅ All Extensions Working

- No validation errors in output panel
- Copilot Chat responding correctly
- ESLint showing inline errors
- Prettier formatting on save
- Tailwind IntelliSense active
- Vitest tests discoverable
- Playwright tests runnable

### ✅ Performance Metrics

- VS Code startup time < 3 seconds
- Extension activation time < 2 seconds
- Memory usage < 500MB
- No freezing or lag during typing

### ✅ Sync Configuration

- All 14 extensions included in recommendations
- No unwanted extensions in sync
- Settings properly synchronized
- Consistent across workspace reloads

## 📊 Monitoring Commands

```bash
# Check extension performance
Ctrl+Shift+P > "Developer: Show Extensions Runtime"

# Monitor memory usage
Ctrl+Shift+P > "Developer: Process Explorer"

# View extension logs
Ctrl+Shift+P > "Developer: Set Log Level"
```

---

**Status**: All 14 extensions configured and optimized  
**Performance**: High-performance settings applied  
**Sync**: Enabled for consistent workspace experience  
**Last Updated**: June 17, 2025
