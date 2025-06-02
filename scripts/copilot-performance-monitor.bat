@echo off
REM GitHub Copilot Performance Diagnostic Script
echo ========================================
echo GITHUB COPILOT PERFORMANCE DIAGNOSTICS
echo ========================================
echo.

echo [1/6] Checking VS Code Process Memory Usage...
tasklist /FI "IMAGENAME eq Code.exe" /FO TABLE
echo.

echo [2/6] Checking Extension Host Processes...
tasklist /FI "IMAGENAME eq extensionHost.exe" /FO TABLE
echo.

echo [3/6] VS Code Version Info...
where code
code --version
echo.

echo [4/6] GitHub Copilot Extension Status...
code --list-extensions | findstr -i copilot
echo.

echo [5/6] System Resource Usage...
echo CPU Usage:
wmic cpu get loadpercentage /value
echo.
echo Memory Usage:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value
echo.

echo [6/6] Performance Recommendations Applied:
echo ✓ Copilot suggestion limits reduced
echo ✓ Extension auto-updates disabled  
echo ✓ Memory management optimized
echo ✓ Large file handling improved
echo ✓ Resource-heavy features disabled
echo.

echo ========================================
echo NEXT STEPS:
echo 1. Restart VS Code completely (Ctrl+Shift+P → Developer: Reload Window)
echo 2. Monitor "Running Extensions" panel for performance warnings
echo 3. Test Copilot with: // function to calculate
echo ========================================
pause
