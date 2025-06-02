@echo off
echo 📊 VS Code Extensions Status Check
echo ===================================
echo.

echo 🔍 Checking currently installed extensions...
echo.

echo ✅ ESSENTIAL EXTENSIONS (should be installed):
echo.

echo Checking GitHub Copilot...
code --list-extensions | findstr "github.copilot" >nul 2>&1
if %errorlevel%==0 (echo ✅ GitHub Copilot - INSTALLED) else (echo ❌ GitHub Copilot - MISSING)

echo Checking ESLint...
code --list-extensions | findstr "dbaeumer.vscode-eslint" >nul 2>&1
if %errorlevel%==0 (echo ✅ ESLint - INSTALLED) else (echo ❌ ESLint - MISSING)

echo Checking Prettier...
code --list-extensions | findstr "esbenp.prettier-vscode" >nul 2>&1
if %errorlevel%==0 (echo ✅ Prettier - INSTALLED) else (echo ❌ Prettier - MISSING)

echo Checking TypeScript...
code --list-extensions | findstr "ms-vscode.vscode-typescript-next" >nul 2>&1
if %errorlevel%==0 (echo ✅ TypeScript - INSTALLED) else (echo ❌ TypeScript - MISSING)

echo Checking Tailwind CSS...
code --list-extensions | findstr "bradlc.vscode-tailwindcss" >nul 2>&1
if %errorlevel%==0 (echo ✅ Tailwind CSS - INSTALLED) else (echo ❌ Tailwind CSS - MISSING)

echo Checking Error Lens...
code --list-extensions | findstr "usernamehw.errorlens" >nul 2>&1
if %errorlevel%==0 (echo ✅ Error Lens - INSTALLED) else (echo ❌ Error Lens - MISSING)

echo Checking GitLens...
code --list-extensions | findstr "eamodio.gitlens" >nul 2>&1
if %errorlevel%==0 (echo ✅ GitLens - INSTALLED) else (echo ❌ GitLens - MISSING)

echo.
echo ❌ REMOVED EXTENSIONS (should NOT be installed):
echo.

echo Checking Vue.js...
code --list-extensions | findstr "vue.volar" >nul 2>&1
if %errorlevel%==0 (echo ❌ Vue.js - STILL INSTALLED ^(should remove^)) else (echo ✅ Vue.js - REMOVED)

echo Checking CodeRabbit...
code --list-extensions | findstr "coderabbit.coderabbit-vscode" >nul 2>&1
if %errorlevel%==0 (echo ❌ CodeRabbit - STILL INSTALLED ^(should remove^)) else (echo ✅ CodeRabbit - REMOVED)

echo Checking Docker...
code --list-extensions | findstr "ms-azuretools.vscode-docker" >nul 2>&1
if %errorlevel%==0 (echo ❌ Docker - STILL INSTALLED ^(should remove^)) else (echo ✅ Docker - REMOVED)

echo Checking Firefox DevTools...
code --list-extensions | findstr "firefox-devtools.vscode-firefox-debug" >nul 2>&1
if %errorlevel%==0 (echo ❌ Firefox DevTools - STILL INSTALLED ^(should remove^)) else (echo ✅ Firefox DevTools - REMOVED)

echo.
echo 📈 EXTENSION COUNT:
code --list-extensions | find /c /v "" > temp_count.txt
set /p extension_count=<temp_count.txt
del temp_count.txt
echo Total installed extensions: %extension_count%
echo.
if %extension_count% leq 15 (
    echo ✅ EXCELLENT! Extension count is optimized ^(15 or fewer^)
) else if %extension_count% leq 20 (
    echo ⚠️ GOOD! But could be further optimized ^(%extension_count% extensions^)
) else (
    echo ❌ TOO MANY! Consider removing more extensions ^(%extension_count% extensions^)
)

echo.
echo 🚀 Next steps:
echo   1. Restart VS Code: Ctrl+Shift+P ^> "Developer: Reload Window"
echo   2. Test core functionality
echo   3. Check performance improvements
echo.
pause
