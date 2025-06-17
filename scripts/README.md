# Trade-Pro Development Scripts

This directory contains custom scripts to support the Trade-Pro development workflow.

## 📋 Script Inventory

### 🔧 Development Tools

#### `fix-vitest.sh`

**Purpose**: Resolves Vitest extension compatibility issues
**Usage**: `./scripts/fix-vitest.sh`
**Function**: Disables problematic Vitest VS Code extension while preserving testing functionality
**Status**: ✅ Active (addresses known Vitest v3.x compatibility issues)

#### `manage-ports.sh`

**Purpose**: Manages development server ports and prevents conflicts
**Usage**: `./scripts/manage-ports.sh [action]`
**Function**: Kills processes on common development ports (3000, 5173, 8080)
**Status**: ✅ Active (essential for Codespaces port management)

### 🛠️ Utility Scripts

#### `fix-copilot-chat.sh`

**Purpose**: Resolves GitHub Copilot Chat configuration issues
**Usage**: `./scripts/fix-copilot-chat.sh`
**Function**: Fixes common Copilot Chat authentication and configuration problems
**Status**: ✅ Active (addresses Codespaces Copilot issues)

#### `list-copilot-commands.sh`

**Purpose**: Lists available GitHub Copilot commands and status
**Usage**: `./scripts/list-copilot-commands.sh`
**Function**: Displays Copilot configuration and available commands
**Status**: ✅ Active (debugging tool)

## 🚀 Quick Start

### Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

### Run All Health Checks

```bash
# Check and fix common issues
./scripts/manage-ports.sh
./scripts/fix-copilot-chat.sh
./scripts/fix-vitest.sh
```

## 📊 Script Dependencies

| Script                     | Dependencies     | Platform    |
| -------------------------- | ---------------- | ----------- |
| `fix-vitest.sh`            | npm, bash        | Linux/macOS |
| `manage-ports.sh`          | lsof, kill, bash | Linux/macOS |
| `fix-copilot-chat.sh`      | gh CLI, bash     | Linux/macOS |
| `list-copilot-commands.sh` | gh CLI, bash     | Linux/macOS |

## 🛡️ Security Notes

- All scripts are read-only and don't modify source code
- Scripts only modify VS Code settings and kill development processes
- No network requests except GitHub CLI authentication
- Scripts are safe to run in Codespaces environment

## 🔄 Maintenance

### Adding New Scripts

1. Create script in `/scripts/` directory
2. Add shebang line: `#!/bin/bash`
3. Make executable: `chmod +x scripts/script-name.sh`
4. Document in this README
5. Add to package.json scripts if needed

### Script Naming Convention

- Use kebab-case: `script-name.sh`
- Prefix with action: `fix-`, `manage-`, `check-`
- Be descriptive but concise

## 📋 Package.json Integration

These scripts are also available via npm scripts:

```bash
npm run fix:vitest      # ./scripts/fix-vitest.sh
npm run fix:ports       # ./scripts/manage-ports.sh
npm run fix:copilot-chat # ./scripts/fix-copilot-chat.sh
```

## 🎯 Best Practices

1. **Always test scripts** in development before production
2. **Include error handling** for all scripts
3. **Document dependencies** and platform requirements
4. **Use descriptive output** with emojis for clarity
5. **Make scripts idempotent** (safe to run multiple times)
