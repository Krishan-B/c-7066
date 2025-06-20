# Trade-Pro CFD Trading Platform - Extension Management

## 📋 Project Overview

This is a Multi Asset CFD Simulated Trading Platform built with:

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI (shadcn/ui)
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Package Manager**: Bun
- **Version Control**: Git + GitHub

## 🔧 Essential Extensions

The following extensions are **required** for optimal development experience:

### Core Development Extensions

1. **ESLint** (`dbaeumer.vscode-eslint`) - Already installed ✅

   - JavaScript/TypeScript linting
   - Code quality enforcement
   - Auto-fixing on save

2. **Prettier** (`esbenp.prettier-vscode`) - Already installed ✅
   - Code formatting
   - Consistent code style
   - Multi-language support

### Project-Specific Extensions

3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss-intellisense`)

   - Tailwind class autocomplete
   - CSS-in-JS support
   - Hover documentation

4. **Supabase** (`supabase.vscode-supabase-extension`)

   - Database management
   - Real-time subscriptions
   - Auth management
   - Edge Functions support

5. **GitHub Copilot** (`github.copilot`)

   - AI-powered code completions
   - Contextual code suggestions
   - Multi-line and function completions

6. **GitHub Copilot Chat** (`github.copilot-chat`)

   - AI-powered chat interface
   - Contextual code discussions
   - Integrated with GitHub Copilot

### Optional Extensions

- **Auto Rename Tag** (`formulahendry.auto-rename-tag`)

  - Automatically rename paired HTML/XML tags
  - Works with custom tag names
  - Improves HTML/XML editing efficiency

### Extensions to Disable/Uninstall

- **JavaScript and TypeScript Nightly** (`ms-vscode.vscode-typescript-next`)

  - Conflicts with the stable TypeScript version
  - Causes unexpected behavior in TypeScript projects

- **Markdown All in One** (`yzhang.markdown-all-in-one`)

  - Conflicts with built-in Markdown support
  - Causes performance issues in Markdown files

- **GitHub Theme** (`github.github-vscode-theme`)

  - Unnecessary if not using GitHub's color theme
  - Can be uninstalled to reduce clutter

- **GitHub Pull Request Integration** (`github.vscode-pull-request-github`)

  - Conflicts with built-in GitHub integration
  - Causes performance issues with repository loading

## 🚫 Extensions to Avoid

These extensions can cause **conflicts** and **performance issues**:

### AI Coding Assistants (Use Only One)

- ❌ `tabnine.tabnine-vscode` - Conflicts with GitHub Copilot
- ❌ `codeium.codeium` - Conflicts with GitHub Copilot
- ❌ `blackboxapp.blackbox` - Conflicts with GitHub Copilot
- ✅ `github.copilot` - Already installed (preferred choice)

### Language/Runtime Extensions (Not Needed)

- ❌ `ms-python.python` - Not needed for this TypeScript project
- ❌ `redhat.java` - Not needed for this TypeScript project
- ❌ `formulahendry.code-runner` - Can cause conflicts with Vite dev server

### Remote Development (Not Needed in Codespaces)

- ❌ `ms-vscode.remote-containers` - Already in Codespaces
- ❌ `ms-vscode.remote-ssh` - Not needed in cloud environment
- ❌ `ms-vscode.remote-wsl` - Not needed in Linux environment

## 🛠️ Quick Setup Commands

### Install Essential Extensions

```bash
# Run the automated installer
npm run extensions:install
# or
./scripts/install-extensions.sh
```

### Clean Up Unwanted Extensions

```bash
# Run the cleanup script (interactive)
npm run extensions:cleanup
# or
./scripts/cleanup-extensions.sh
```

### Full Workspace Setup

```bash
# Install dependencies + extensions
npm run setup:workspace
```

## 📂 VS Code Configuration

The workspace is pre-configured with optimal settings in `.vscode/`:

- **settings.json** - Editor preferences, formatters, and tool configs
- **extensions.json** - Recommended extensions list
- **tasks.json** - Build and development tasks
- **launch.json** - Debug configurations

## 🔍 Troubleshooting Common Issues

### "Multiple Formatters" Error

- **Cause**: Conflicting formatter extensions
- **Solution**: Extensions are configured with default formatters in settings.json

### "Remote Host Restarted" Error

- **Cause**: Too many extensions or memory-heavy extensions
- **Solution**: Use cleanup script to remove unnecessary extensions

### "Performance Error"

- **Cause**: Extensions running conflicting processes
- **Solution**: Disable AI coding assistants except GitHub Copilot

### "Dependency Conflicts"

- **Cause**: Extensions trying to manage the same files/processes
- **Solution**: Follow the essential-only extension list

## 📊 Extension Performance Impact

| Extension Type         | Performance Impact | Recommendation |
| ---------------------- | ------------------ | -------------- |
| ESLint + Prettier      | Low                | ✅ Essential   |
| Tailwind IntelliSense  | Low                | ✅ Essential   |
| Supabase               | Low                | ✅ Essential   |
| GitLens                | Medium             | ✅ Recommended |
| Multiple AI Assistants | High               | ❌ Avoid       |
| Code Runner            | Medium             | ❌ Not needed  |
| Remote Extensions      | High               | ❌ Not needed  |

## 🚀 Best Practices

1. **Minimal Extension Set**: Only install extensions you actively use
2. **One AI Assistant**: Stick with GitHub Copilot (already installed)
3. **Regular Cleanup**: Run cleanup script monthly
4. **Settings Sync**: Use VS Code settings sync for consistency
5. **Extension Reviews**: Check extension reviews and update frequency

## 📝 Package Scripts

The following npm scripts are available for extension management:

```json
{
  "extensions:install": "bash scripts/install-extensions.sh",
  "extensions:cleanup": "bash scripts/cleanup-extensions.sh",
  "setup:workspace": "bun install && npm run extensions:install",
  "dev:full": "npm run extensions:install && npm run dev"
}
```

## 🔐 Security Considerations

- Only install extensions from verified publishers
- Review extension permissions before installation
- Avoid extensions with excessive data collection
- Keep extensions updated for security patches

---

**Need Help?** Check the project's main README.md for more development setup information.
