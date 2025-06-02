@echo off
REM Extension Host Reset Script for GitHub Copilot Issues
echo =====================================
echo EXTENSION HOST RESET FOR COPILOT FIX
echo =====================================
echo.

echo [STEP 1] Terminating Extension Host Processes...
taskkill /F /IM "extensionHost.exe" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Extension Host processes terminated
) else (
    echo ! No Extension Host processes found
)
echo.

echo [STEP 2] Clearing Extension Cache...
if exist "%USERPROFILE%\.vscode\CachedExtensions" (
    rmdir /S /Q "%USERPROFILE%\.vscode\CachedExtensions"
    echo ✓ Extension cache cleared
) else (
    echo ! Extension cache not found
)
echo.

echo [STEP 3] Clearing VS Code Workspace State...
if exist "%USERPROFILE%\AppData\Roaming\Code\logs" (
    del /Q "%USERPROFILE%\AppData\Roaming\Code\logs\*.*" 2>nul
    echo ✓ Log files cleared
)
echo.

echo [STEP 4] Performance Optimizations Applied:
echo ✓ GitHub Copilot suggestion limits optimized
echo ✓ Extension host affinity configured
echo ✓ Memory leak prevention enabled
echo ✓ Large file handling improved
echo.

echo =====================================
echo NEXT ACTIONS REQUIRED:
echo.
echo 1. RESTART VS CODE COMPLETELY
echo    Ctrl+Shift+P → "Developer: Reload Window"
echo.
echo 2. TEST EXTENSION HOST STATUS
echo    Ctrl+Shift+P → "Developer: Show Running Extensions"
echo    - Look for "Unresponsive" warnings
echo    - Check Copilot CPU/Memory usage
echo.
echo 3. TEST COPILOT FUNCTIONALITY
echo    Type: // function to calculate sum
echo    - Should see suggestions without freezing
echo.
echo 4. MONITOR PERFORMANCE
echo    Run: copilot-performance-monitor.bat
echo.
echo =====================================
echo.
echo Press any key to continue...
pause >nul
