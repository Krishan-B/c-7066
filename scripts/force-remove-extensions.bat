@echo off
echo ⚡ FORCE REMOVING UNNECESSARY EXTENSIONS
echo ========================================

echo 🗑️ Closing VS Code processes...
taskkill /f /im Code.exe 2>nul
timeout /t 3 /nobreak >nul

echo 🗑️ Force removing Vue.js extension...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\vue.volar-2.2.10" 2>nul

echo 🗑️ Force removing CodeRabbit extension...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\coderabbit.coderabbit-vscode-0.7.10" 2>nul

echo 🗑️ Force removing Firefox DevTools...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\firefox-devtools.vscode-firefox-debug-2.15.0" 2>nul

echo 🗑️ Force removing Docker extensions...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-azuretools.vscode-docker-2.0.0" 2>nul
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-azuretools.vscode-containers-2.0.2" 2>nul

echo 🗑️ Force removing Edge DevTools...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-edgedevtools.vscode-edge-devtools-2.1.8" 2>nul

echo 🗑️ Force removing MSSQL extensions...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-mssql.data-workspace-vscode-0.6.2" 2>nul
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-mssql.mssql-1.32.0" 2>nul
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-mssql.sql-bindings-vscode-0.4.1" 2>nul
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-mssql.sql-database-projects-vscode-1.5.2" 2>nul

echo 🗑️ Force removing Azure extensions...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-vscode.azure-repos-0.40.0" 2>nul

echo 🗑️ Force removing remote extensions...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\ms-vscode.remote-repositories-0.42.0" 2>nul
rmdir /s /q "%USERPROFILE%\.vscode\extensions\github.remotehub-0.64.0" 2>nul
rmdir /s /q "%USERPROFILE%\.vscode\extensions\github.codespaces-1.17.3" 2>nul

echo 🗑️ Force removing npm intellisense...
rmdir /s /q "%USERPROFILE%\.vscode\extensions\christian-kohler.npm-intellisense-1.4.5" 2>nul

echo ✅ Extension removal complete!

echo 📊 Checking new extension count...
for /f %%i in ('dir "%USERPROFILE%\.vscode\extensions" /b ^| find /c /v ""') do echo Extension count: %%i

echo.
echo ⚠️  IMPORTANT: Please restart VS Code completely for changes to take effect
echo.
pause
