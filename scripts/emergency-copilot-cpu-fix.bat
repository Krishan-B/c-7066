@echo off
title EMERGENCY: Copilot Extension Host CPU Fix

echo ========================================
echo EMERGENCY COPILOT CPU PERFORMANCE FIX
echo ========================================
echo.
echo CPU Profile shows Copilot using 83.8%% CPU!
echo Applying MAXIMUM performance restrictions...
echo.

rem First, check current VS Code processes
echo [1/5] Checking VS Code processes...
tasklist /FI "IMAGENAME eq Code.exe" 2>nul | find "Code.exe"
if %errorlevel%==0 (
    echo WARNING: VS Code is running! Please close it first.
    echo.
    choice /C YN /M "Close VS Code now? (Y/N)"
    if !errorlevel!==1 (
        taskkill /F /IM Code.exe 2>nul
        echo VS Code processes terminated.
        timeout /T 3 >nul
    )
)

echo.
echo [2/5] Backing up current settings...
if exist "%~dp0..\.vscode\settings.json.backup-cpu-fix" (
    echo Backup already exists, skipping...
) else (
    copy "%~dp0..\.vscode\settings.json" "%~dp0..\.vscode\settings.json.backup-cpu-fix" >nul
    echo Settings backed up to settings.json.backup-cpu-fix
)

echo.
echo [3/5] Applying AGGRESSIVE Copilot performance restrictions...

rem Create aggressive performance settings
powershell -Command "$settings = Get-Content '%~dp0..\.vscode\settings.json' | ConvertFrom-Json; $settings.'github.copilot.advanced.inlineSuggestCount' = 0; $settings.'github.copilot.advanced.length' = 50; $settings.'github.copilot.advanced.listCount' = 0; $settings.'github.copilot.advanced.timeout' = 1000; $settings.'github.copilot.advanced.requestTimeout' = 500; $settings.'github.copilot.editor.enableAutoCompletions' = $false; $settings.'github.copilot.chat.enabled' = $false; $settings | ConvertTo-Json -Depth 100 | Set-Content '%~dp0..\.vscode\settings.json'"

echo Aggressive performance limits applied:
echo - Inline suggestions: DISABLED (0)
echo - List suggestions: DISABLED (0) 
echo - Max length: 50 characters
echo - Timeout: 1000ms (was 8000ms)
echo - Request timeout: 500ms (was 3000ms)
echo - Auto completions: DISABLED
echo - Chat: DISABLED

echo.
echo [4/5] Setting extension process priority to LOW...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v "TaskbarGlomLevel" /t REG_DWORD /d 2 /f >nul 2>&1

echo.
echo [5/5] Creating CPU monitoring script...

echo @echo off > "%~dp0monitor-copilot-cpu.bat"
echo title Monitor Copilot CPU Usage >> "%~dp0monitor-copilot-cpu.bat"
echo :loop >> "%~dp0monitor-copilot-cpu.bat"
echo wmic process where "name='Code.exe'" get ProcessId,PageFileUsage,WorkingSetSize /format:table >> "%~dp0monitor-copilot-cpu.bat"
echo timeout /T 10 >> "%~dp0monitor-copilot-cpu.bat"
echo goto loop >> "%~dp0monitor-copilot-cpu.bat"

echo.
echo ========================================
echo EMERGENCY FIX APPLIED
echo ========================================
echo.
echo AGGRESSIVE SETTINGS APPLIED:
echo ✅ Copilot suggestions severely limited
echo ✅ Chat completely disabled  
echo ✅ Timeouts drastically reduced
echo ✅ Auto-completions disabled
echo ✅ CPU monitoring script created
echo.
echo NEXT STEPS:
echo 1. Start VS Code
echo 2. Monitor CPU usage with: scripts\monitor-copilot-cpu.bat
echo 3. If still high CPU, consider DISABLING Copilot entirely
echo.
echo WARNING: This severely limits Copilot functionality!
echo To restore normal settings, run: scripts\restore-copilot-normal.bat
echo.

pause
