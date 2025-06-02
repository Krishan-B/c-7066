@echo off
title NUCLEAR OPTION: Completely Disable GitHub Copilot

echo ========================================
echo NUCLEAR OPTION: DISABLE COPILOT ENTIRELY
echo ========================================
echo.
echo WARNING: This will COMPLETELY DISABLE GitHub Copilot!
echo Use this only if CPU usage remains critical.
echo.

choice /C YN /M "Are you sure you want to DISABLE Copilot entirely? (Y/N)"
if %errorlevel%==2 goto :cancel

echo.
echo [1/4] Backing up current settings...
copy "%~dp0..\.vscode\settings.json" "%~dp0..\.vscode\settings.json.backup-nuclear" >nul
echo Settings backed up to settings.json.backup-nuclear

echo.
echo [2/4] Adding Copilot disable settings...

rem Use PowerShell to modify JSON
powershell -Command "
$settings = Get-Content '%~dp0..\.vscode\settings.json' | ConvertFrom-Json
$settings.'github.copilot.enable' = @{'*' = $false}
$settings.'github.copilot.chat.enabled' = $false
$settings.'github.copilot.editor.enableAutoCompletions' = $false
$settings.'github.copilot.renameSuggestions.triggerAutomatically' = $false
$settings.'github.copilot.editor.enableCodeActions' = $false
$settings.'github.copilot.editor.iterativeFixing' = $false
$settings | ConvertTo-Json -Depth 100 | Set-Content '%~dp0..\.vscode\settings.json'
"

echo.
echo [3/4] Disabling Copilot extension via VS Code CLI...
code --disable-extension GitHub.copilot --disable-extension GitHub.copilot-chat 2>nul

echo.
echo [4/4] Creating restoration script...

echo @echo off > "%~dp0restore-copilot.bat"
echo title Restore GitHub Copilot >> "%~dp0restore-copilot.bat"
echo copy "%%~dp0..\.vscode\settings.json.backup-nuclear" "%%~dp0..\.vscode\settings.json" >> "%~dp0restore-copilot.bat"
echo code --enable-extension GitHub.copilot --enable-extension GitHub.copilot-chat >> "%~dp0restore-copilot.bat"
echo echo Copilot restored! Restart VS Code. >> "%~dp0restore-copilot.bat"
echo pause >> "%~dp0restore-copilot.bat"

echo.
echo ========================================
echo COPILOT COMPLETELY DISABLED
echo ========================================
echo.
echo ✅ Copilot is now COMPLETELY DISABLED
echo ✅ Extension host CPU should drop dramatically
echo ✅ Restoration script created: scripts\restore-copilot.bat
echo.
echo NEXT STEPS:
echo 1. Restart VS Code
echo 2. Monitor CPU usage
echo 3. If you want Copilot back: scripts\restore-copilot.bat
echo.

goto :end

:cancel
echo.
echo Operation cancelled. Copilot remains enabled with restrictions.
echo.

:end
pause
