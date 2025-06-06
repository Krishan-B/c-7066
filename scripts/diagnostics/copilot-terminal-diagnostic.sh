#!/bin/bash

# GitHub Copilot & Terminal Diagnostic Script
# For Trading Pro CFD Platform

echo "=== GitHub Copilot & Terminal Performance Diagnostic ==="
echo "Date: $(date)"
echo ""

echo "🔍 CHECKING SYSTEM CONFIGURATION:"
echo "Operating System: $(uname -a 2>/dev/null || echo 'Windows detected')"
echo "Current Shell: $SHELL"
echo "Current Directory: $(pwd)"
echo ""

echo "🔍 CHECKING VS CODE EXTENSIONS:"
if command -v code &> /dev/null; then
    echo "VS Code CLI available"
    echo "Installed extensions containing 'copilot':"
    code --list-extensions 2>/dev/null | grep -i copilot || echo "No Copilot extensions found"
    echo ""
    echo "Total extensions installed: $(code --list-extensions 2>/dev/null | wc -l)"
else
    echo "VS Code CLI not available"
fi
echo ""

echo "🔍 CHECKING TERMINAL FUNCTIONALITY:"
echo "Echo test: Hello from diagnostic script"
echo "Path test: $PATH"
echo "Home directory: $HOME"
echo ""

echo "🔍 CHECKING PROJECT STRUCTURE:"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "Node.js project detected"
    if command -v npm &> /dev/null; then
        echo "npm version: $(npm --version)"
    fi
    if command -v node &> /dev/null; then
        echo "Node.js version: $(node --version)"
    fi
else
    echo "❌ package.json not found"
fi
echo ""

echo "🔍 CHECKING ESLINT CONFIGURATION:"
if [ -f "eslint.config.js" ]; then
    echo "✅ eslint.config.js found (modern flat config)"
elif [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
    echo "⚠️  Legacy ESLint config found"
else
    echo "❌ No ESLint config found"
fi

if [ -f ".eslintcache" ]; then
    echo "✅ ESLint cache exists"
    echo "Cache size: $(stat -f%z .eslintcache 2>/dev/null || stat -c%s .eslintcache 2>/dev/null || echo 'Unknown')"
fi
echo ""

echo "🔍 CHECKING PERFORMANCE FILES:"
echo "VS Code settings: $([ -f '.vscode/settings.json' ] && echo '✅ Found' || echo '❌ Missing')"
echo "VS Code tasks: $([ -f '.vscode/tasks.json' ] && echo '✅ Found' || echo '❌ Missing')"
echo "VS Code extensions: $([ -f '.vscode/extensions.json' ] && echo '✅ Found' || echo '❌ Missing')"
echo ""

echo "🔍 MEMORY AND PROCESS CHECK:"
if command -v ps &> /dev/null; then
    echo "VS Code processes:"
    ps aux 2>/dev/null | grep -i "code\|copilot" | grep -v grep || echo "No VS Code processes detected"
fi
echo ""

echo "🔧 RECOMMENDED ACTIONS:"
echo "1. Restart VS Code completely (Ctrl+Shift+P > Developer: Reload Window)"
echo "2. Install GitHub Copilot if not present"
echo "3. Check GitHub Copilot subscription status"
echo "4. Try terminal command: npm run lint"
echo "5. Test Copilot with: // write a function to"
echo ""

echo "=== DIAGNOSTIC COMPLETE ==="
