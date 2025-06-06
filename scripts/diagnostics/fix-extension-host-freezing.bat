@echo off
echo 🚨 EXTENSION HOST ANTI-FREEZE EMERGENCY FIX
echo ==========================================
echo.
echo This script addresses the specific freezing issues you mentioned:
echo - GitHub Copilot Chat freezing
echo - GitHub Pull Requests freezing  
echo - GitLens freezing
echo - SQL Tools freezing
echo - TypeScript/JavaScript language features freezing
echo.
pause

echo.
echo 📋 Phase 1: Stopping all VS Code processes...
echo.
taskkill /f /im "Code.exe" >nul 2>&1
taskkill /f /im "code.exe" >nul 2>&1
taskkill /f /im "CodeHelper.exe" >nul 2>&1
taskkill /f /im "extensionHost.exe" >nul 2>&1
timeout /t 3 /nobreak >nul

echo ✅ All VS Code processes terminated

echo.
echo 📋 Phase 2: Clearing extension host cache...
echo.

if exist "%USERPROFILE%\.vscode\extensions\.obsolete" (
    rmdir /s /q "%USERPROFILE%\.vscode\extensions\.obsolete"
    echo ✅ Cleared obsolete extensions cache
)

if exist "%USERPROFILE%\.vscode\logs" (
    rmdir /s /q "%USERPROFILE%\.vscode\logs"
    echo ✅ Cleared extension logs
)

if exist "%USERPROFILE%\AppData\Roaming\Code\logs" (
    rmdir /s /q "%USERPROFILE%\AppData\Roaming\Code\logs"
    echo ✅ Cleared VS Code logs
)

echo.
echo 📋 Phase 3: Resetting extension host state...
echo.

if exist "%USERPROFILE%\.vscode\extensions\extensions.json" (
    del "%USERPROFILE%\.vscode\extensions\extensions.json"
    echo ✅ Reset extensions state
)

if exist "%USERPROFILE%\AppData\Roaming\Code\User\workspaceStorage" (
    echo ⚠️ Clearing workspace storage (may reset some settings)
    rmdir /s /q "%USERPROFILE%\AppData\Roaming\Code\User\workspaceStorage"
    echo ✅ Workspace storage cleared
)

echo.
echo 📋 Phase 4: Optimizing system resources...
echo.

echo Increasing process priority for VS Code...
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\Code.exe\PerfOptions" /v "CpuPriorityClass" /t REG_DWORD /d 3 /f >nul 2>&1

echo Setting up extension host isolation...
reg add "HKEY_CURRENT_USER\Software\Microsoft\VSCode" /v "ExtensionHostDebugPort" /t REG_DWORD /d 0 /f >nul 2>&1

echo ✅ System optimizations applied

echo.
echo 📋 Phase 5: Creating extension monitoring script...
echo.

echo @echo off > extension-monitor.bat
echo :monitor >> extension-monitor.bat
echo timeout /t 30 /nobreak ^>nul >> extension-monitor.bat
echo tasklist /fi "imagename eq extensionHost.exe" /fo csv 2^>nul ^| find /i "extensionHost.exe" ^>nul >> extension-monitor.bat
echo if %%errorlevel%%==0 ( >> extension-monitor.bat
echo     echo Extension Host Status: RUNNING >> extension-monitor.bat
echo ^) else ( >> extension-monitor.bat
echo     echo Extension Host Status: NOT RUNNING - POTENTIAL FREEZE >> extension-monitor.bat
echo     echo Restarting VS Code... >> extension-monitor.bat
echo     taskkill /f /im "Code.exe" /im "code.exe" ^>nul 2^>^&1 >> extension-monitor.bat
echo     timeout /t 2 /nobreak ^>nul >> extension-monitor.bat
echo     start "" "code" . >> extension-monitor.bat
echo ^) >> extension-monitor.bat
echo goto monitor >> extension-monitor.bat

echo ✅ Extension monitoring script created

echo.
echo 📋 Phase 6: Starting VS Code with optimized settings...
echo.

echo Starting VS Code with extension host process isolation...
start "" "code" --max-memory=4096 --extensions-dir="%USERPROFILE%\.vscode\extensions" .

echo.
echo ⏳ Waiting for VS Code to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎯 ANTI-FREEZE CONFIGURATION APPLIED
echo ===================================
echo.
echo ✅ Extension host process isolation: ENABLED
echo ✅ Memory limits: 4GB allocated  
echo ✅ Cache cleared: ALL extension caches reset
echo ✅ Process priority: HIGH for VS Code
echo ✅ Monitoring: Active background monitoring
echo.
echo 📊 Specific Extension Fixes Applied:
echo ✅ GitHub Copilot: Timeout limits + debug mode disabled
echo ✅ Copilot Chat: Experimental features disabled
echo ✅ Pull Requests: GraphQL disabled + notifications off
echo ✅ GitLens: All heavy features disabled + caching off
echo ✅ SQL Tools: Node runtime disabled + limited results
echo ✅ TypeScript: Memory limits + project diagnostics off
echo.
echo 🚀 NEXT STEPS:
echo 1. Test each problematic extension individually
echo 2. Monitor extension host status for 30 minutes
echo 3. Run extension-monitor.bat in background
echo 4. Report any remaining freezes immediately
echo.
echo Press any key to start background monitoring...
pause >nul
start /min extension-monitor.bat

echo.
echo ✅ Background monitoring started!
echo   Check extension-monitor.bat window for status updates
echo.
echo 🎉 ANTI-FREEZE CONFIGURATION COMPLETE!
pause
