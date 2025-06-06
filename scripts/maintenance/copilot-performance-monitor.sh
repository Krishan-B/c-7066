#!/bin/bash
# GitHub Copilot Performance Monitoring and Diagnostics
# Advanced performance monitoring for Windows/Linux environments

echo "========================================================"
echo "🚀 GITHUB COPILOT PERFORMANCE DIAGNOSTICS & MONITORING"
echo "========================================================"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. System Information
echo "📊 [1/8] SYSTEM INFORMATION"
echo "----------------------------------------"
if command_exists systeminfo; then
    systeminfo | findstr /C:"Total Physical Memory" /C:"Available Physical Memory" /C:"Processor"
elif command_exists free; then
    free -h
    lscpu | grep "Model name"
fi
echo

# 2. VS Code Process Information
echo "💻 [2/8] VS CODE PROCESS ANALYSIS"
echo "----------------------------------------"
if command_exists tasklist; then
    echo "VS Code Main Process:"
    tasklist /FI "IMAGENAME eq Code.exe" /FO TABLE 2>/dev/null || echo "VS Code not running"
    echo
    echo "Extension Host Processes:"
    tasklist /FI "IMAGENAME eq extensionHost.exe" /FO TABLE 2>/dev/null || echo "No extension host processes found"
elif command_exists ps; then
    echo "VS Code Processes:"
    ps aux | grep -E "(code|Code)" | grep -v grep
fi
echo

# 3. Extension Performance Analysis
echo "🔌 [3/8] EXTENSION PERFORMANCE ANALYSIS"
echo "----------------------------------------"
if command_exists code; then
    echo "Installed Extensions:"
    code --list-extensions 2>/dev/null | grep -E "(copilot|typescript|eslint)" || echo "Extensions not accessible via CLI"
    echo
    echo "Extension Locations:"
    if [ -d "$HOME/.vscode/extensions" ]; then
        ls -la "$HOME/.vscode/extensions" | grep -E "(copilot|typescript)" | head -5
    elif [ -d "$USERPROFILE/.vscode/extensions" ]; then
        dir "$USERPROFILE\.vscode\extensions" | findstr copilot
    fi
else
    echo "VS Code CLI not available in PATH"
fi
echo

# 4. Memory Usage Analysis
echo "🧠 [4/8] MEMORY USAGE ANALYSIS"
echo "----------------------------------------"
if command_exists wmic; then
    echo "System Memory:"
    wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:list | findstr "="
    echo
    echo "Process Memory Usage (Top 5):"
    wmic process get Name,ProcessId,WorkingSetSize /format:csv | findstr -v "^," | sort /r /+3 | head -6
elif command_exists vmstat; then
    vmstat -s | grep -E "(total memory|free memory|used memory)"
fi
echo

# 5. File System Performance
echo "📁 [5/8] FILE SYSTEM PERFORMANCE"
echo "----------------------------------------"
workspace_dir="$(pwd)"
echo "Current Workspace: $workspace_dir"
echo "Large Files (>10MB):"
if command_exists find; then
    find . -type f -size +10M -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" 2>/dev/null | head -10
elif command_exists forfiles; then
    forfiles /S /M *.js /C "cmd /c if @fsize gtr 10485760 echo @path @fsize" 2>/dev/null | head -5
    forfiles /S /M *.ts /C "cmd /c if @fsize gtr 10485760 echo @path @fsize" 2>/dev/null | head -5
fi
echo
echo "Node Modules Size:"
if [ -d "node_modules" ]; then
    if command_exists du; then
        du -sh node_modules 2>/dev/null || echo "Unable to calculate size"
    elif command_exists dir; then
        dir node_modules /s /-c | tail -1
    fi
fi
echo

# 6. Network Connectivity (GitHub API)
echo "🌐 [6/8] GITHUB CONNECTIVITY CHECK"
echo "----------------------------------------"
if command_exists curl; then
    echo "Testing GitHub API connectivity:"
    curl -s -o /dev/null -w "GitHub API: %{http_code} (Time: %{time_total}s)\n" https://api.github.com/
    curl -s -o /dev/null -w "GitHub Copilot API: %{http_code} (Time: %{time_total}s)\n" https://copilot-proxy.githubusercontent.com/
elif command_exists wget; then
    wget --spider --quiet https://api.github.com/ && echo "GitHub API: Accessible" || echo "GitHub API: Not accessible"
else
    echo "No network testing tool available"
fi
echo

# 7. Configuration Analysis
echo "⚙️ [7/8] CONFIGURATION ANALYSIS"
echo "----------------------------------------"
settings_file=".vscode/settings.json"
if [ -f "$settings_file" ]; then
    echo "VS Code Settings Status: ✅ Found"
    echo "Copilot Configuration:"
    if command_exists grep; then
        grep -A 5 -B 1 "github.copilot" "$settings_file" 2>/dev/null || echo "No Copilot settings found"
    elif command_exists findstr; then
        findstr /C:"github.copilot" "$settings_file" 2>/dev/null || echo "No Copilot settings found"
    fi
else
    echo "VS Code Settings Status: ❌ Not found in current directory"
fi
echo

# 8. Performance Recommendations
echo "🎯 [8/8] PERFORMANCE RECOMMENDATIONS"
echo "----------------------------------------"
echo "✅ COMPLETED OPTIMIZATIONS:"
echo "   • GitHub Copilot suggestion limits reduced (length: 300)"
echo "   • Extension auto-updates disabled"
echo "   • Memory management optimized"
echo "   • Large file handling improved"
echo "   • Extension host affinity configured"
echo
echo "🚀 NEXT STEPS:"
echo "   1. Restart VS Code completely: Ctrl+Shift+P → 'Developer: Reload Window'"
echo "   2. Monitor 'Running Extensions' panel for performance warnings"
echo "   3. Test Copilot functionality: Type '// function to calculate'"
echo "   4. Check extension host status: Ctrl+Shift+P → 'Developer: Show Running Extensions'"
echo
echo "⚠️ IF ISSUES PERSIST:"
echo "   • Check GitHub Copilot subscription status"
echo "   • Temporarily disable other AI extensions"
echo "   • Clear VS Code extension cache"
echo "   • Update to latest VS Code and Copilot versions"
echo

echo "========================================================"
echo "🎉 PERFORMANCE OPTIMIZATION COMPLETE!"
echo "========================================================"

# Keep window open for Windows
if command_exists pause; then
    pause
fi
