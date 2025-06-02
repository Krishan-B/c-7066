@echo off
title Verify Copilot Telemetry & Public Code Matching Fix

echo ========================================
echo VERIFY COPILOT TELEMETRY DISABLED
echo ========================================
echo.

echo [1/3] Checking settings.json syntax...
echo.

rem Check if settings.json is valid JSON
powershell -Command "try { Get-Content '%~dp0..\.vscode\settings.json' | ConvertFrom-Json | Out-Null; Write-Host 'SUCCESS: settings.json syntax is valid' -ForegroundColor Green } catch { Write-Host 'ERROR: settings.json has syntax errors' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red }"

echo.
echo [2/3] Verifying telemetry settings...
echo.

rem Check telemetry settings
findstr /i "telemetry.*false" "%~dp0..\.vscode\settings.json" >nul
if %errorlevel%==0 (
    echo SUCCESS: Telemetry disabled settings found
) else (
    echo WARNING: Could not verify telemetry disabled
)

echo.
echo [3/3] Verifying public code matching settings...
echo.

rem Check public code matching settings
findstr /i "publicCode.*false" "%~dp0..\.vscode\settings.json" >nul
if %errorlevel%==0 (
    echo SUCCESS: Public code matching disabled settings found
) else (
    echo WARNING: Could not verify public code matching disabled
)

echo.
echo ========================================
echo NEXT STEPS
echo ========================================
echo.
echo 1. Restart VS Code completely
echo 2. Reload the workspace 
echo 3. Check the Output panel (Help ^> Toggle Developer Tools ^> Console)
echo 4. Look for these messages should be GONE:
echo    - "Error sending telemetry"
echo    - "Public code references are enabled"
echo.
echo If you still see telemetry errors, please share the new logs.
echo.

pause
