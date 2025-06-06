@echo off
echo 🔍 EXTENSION HOST FREEZE DIAGNOSTIC REPORT
echo ==========================================
echo.

echo 📊 Checking Extension Host Configuration...
echo.

echo ✅ ANTI-FREEZE SETTINGS VERIFICATION:
echo.

echo 🔧 Extension Process Affinity:
findstr "extensions.experimental.affinity" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Extension affinity: CONFIGURED
    findstr -A 8 "extensions.experimental.affinity" .vscode\settings.json | findstr "github.copilot"
) else (
    echo ❌ Extension affinity: NOT CONFIGURED
)

echo.
echo 🤖 GitHub Copilot Anti-Freeze:
findstr "github.copilot.advanced.timeout" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Copilot timeout limits: CONFIGURED
) else (
    echo ❌ Copilot timeout limits: MISSING
)

findstr "github.copilot.chat.experimental" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Copilot Chat experimental features: DISABLED
) else (
    echo ❌ Copilot Chat experimental features: NOT DISABLED
)

echo.
echo 🔗 GitHub Pull Requests Anti-Freeze:
findstr "githubPullRequests.experimental.graphql" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Pull Requests GraphQL: DISABLED
) else (
    echo ❌ Pull Requests GraphQL: NOT DISABLED
)

echo.
echo 📈 GitLens Anti-Freeze:
findstr "gitlens.advanced.caching.enabled" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ GitLens caching: DISABLED
    findstr "gitlens.codeLens.enabled" .vscode\settings.json | findstr "false"
    if %errorlevel%==0 (echo ✅ GitLens CodeLens: DISABLED) else (echo ❌ GitLens CodeLens: STILL ENABLED)
) else (
    echo ❌ GitLens caching: NOT CONFIGURED
)

echo.
echo 🗄️ SQL Tools Anti-Freeze:
findstr "sqltools.useNodeRuntime" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ SQL Tools Node runtime: DISABLED
) else (
    echo ❌ SQL Tools Node runtime: NOT CONFIGURED
)

echo.
echo 📝 TypeScript Anti-Freeze:
findstr "typescript.tsserver.maxTsServerMemory" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ TypeScript memory limit: CONFIGURED
) else (
    echo ❌ TypeScript memory limit: NOT SET
)

findstr "typescript.tsserver.experimental.enableProjectDiagnostics" .vscode\settings.json >nul 2>&1
if %errorlevel%==0 (
    echo ✅ TypeScript project diagnostics: DISABLED
) else (
    echo ❌ TypeScript project diagnostics: NOT DISABLED
)

echo.
echo 🔍 CURRENT EXTENSION STATUS:
echo.

echo Checking running extensions...
tasklist /fi "imagename eq extensionHost.exe" /fo csv 2>nul | find /i "extensionHost.exe" >nul
if %errorlevel%==0 (
    echo ✅ Extension Host: RUNNING
    tasklist /fi "imagename eq extensionHost.exe" /fo table
) else (
    echo ❌ Extension Host: NOT RUNNING (potential freeze)
)

echo.
echo Checking VS Code processes...
tasklist /fi "imagename eq Code.exe" /fo csv 2>nul | find /i "Code.exe" >nul
if %errorlevel%==0 (
    echo ✅ VS Code: RUNNING
    tasklist /fi "imagename eq Code.exe" /fo table
) else (
    echo ❌ VS Code: NOT RUNNING
)

echo.
echo 📋 EXTENSION COUNT CHECK:
code --list-extensions 2>nul | find /c /v "" > temp_ext_count.txt
set /p ext_count=<temp_ext_count.txt
del temp_ext_count.txt 2>nul

if %ext_count% leq 15 (
    echo ✅ Extension count: %ext_count% - OPTIMAL
) else if %ext_count% leq 20 (
    echo ⚠️ Extension count: %ext_count% - ACCEPTABLE
) else (
    echo ❌ Extension count: %ext_count% - TOO MANY
)

echo.
echo 🚨 PROBLEMATIC EXTENSIONS CHECK:
echo.

echo Checking for known freeze-causing extensions...
code --list-extensions 2>nul | findstr "vue.volar" >nul 2>&1
if %errorlevel%==0 (echo ❌ Vue.js extension found - REMOVE) else (echo ✅ Vue.js extension - NOT INSTALLED)

code --list-extensions 2>nul | findstr "coderabbit" >nul 2>&1
if %errorlevel%==0 (echo ❌ CodeRabbit extension found - CONFLICTS WITH COPILOT) else (echo ✅ CodeRabbit extension - NOT INSTALLED)

code --list-extensions 2>nul | findstr "firefox-devtools" >nul 2>&1
if %errorlevel%==0 (echo ❌ Firefox DevTools found - REMOVE) else (echo ✅ Firefox DevTools - NOT INSTALLED)

echo.
echo 💾 MEMORY USAGE CHECK:
echo.
echo Current VS Code memory usage:
tasklist /fi "imagename eq Code.exe" /fo table | findstr "Code.exe" 2>nul
tasklist /fi "imagename eq extensionHost.exe" /fo table | findstr "extensionHost.exe" 2>nul

echo.
echo 🎯 RECOMMENDATIONS:
echo.

if %ext_count% gtr 15 (
    echo ⚠️ Consider removing more extensions to improve performance
)

findstr "extensions.experimental.affinity" .vscode\settings.json >nul 2>&1
if not %errorlevel%==0 (
    echo ❌ CRITICAL: Extension affinity not configured - run fix-extension-host-freezing.bat
)

echo.
echo 📊 OVERALL STATUS:
tasklist /fi "imagename eq extensionHost.exe" /fo csv 2>nul | find /i "extensionHost.exe" >nul
if %errorlevel%==0 (
    if %ext_count% leq 15 (
        echo ✅ EXCELLENT: Extension Host stable with optimized extension count
    ) else (
        echo ⚠️ GOOD: Extension Host running but extension count could be optimized
    )
) else (
    echo ❌ CRITICAL: Extension Host not running - immediate action required
)

echo.
echo 🚀 If issues persist, run: scripts\fix-extension-host-freezing.bat
echo.
pause
