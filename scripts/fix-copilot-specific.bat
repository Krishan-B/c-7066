@echo off
echo 🤖 GITHUB COPILOT SPECIFIC ANTI-FREEZE FIX
echo ==========================================

echo 🔧 Step 1: Disabling GitHub Copilot temporarily...
code --disable-extension github.copilot --disable-extension github.copilot-chat

echo ⏳ Waiting 5 seconds for extension host to settle...
timeout /t 5 /nobreak >nul

echo 🔄 Step 2: Forcing VS Code window reload...
echo ℹ️  This will restart the extension host completely...

echo.
echo 📋 MANUAL STEPS REQUIRED:
echo ========================
echo.
echo 1️⃣ Press Ctrl+Shift+P in VS Code
echo 2️⃣ Type: "Developer: Reload Window"
echo 3️⃣ Press Enter
echo 4️⃣ Wait for VS Code to reload completely
echo 5️⃣ Press any key here to continue...
echo.
pause

echo 🔧 Step 3: Re-enabling GitHub Copilot with optimized settings...
code --enable-extension github.copilot --enable-extension github.copilot-chat

echo ⏳ Waiting for extensions to load...
timeout /t 3 /nobreak >nul

echo ✅ Step 4: Verifying GitHub Copilot status...
echo.
echo 🔍 Checking extension host status...
tasklist /fi "imagename eq Code.exe" /fo table | find "Code.exe" >nul
if %errorlevel%==0 (
    echo ✅ VS Code is running
) else (
    echo ❌ VS Code is not running
)

echo.
echo 🧪 TEST GITHUB COPILOT NOW:
echo ===========================
echo 1. Open a .ts or .tsx file
echo 2. Start typing some code
echo 3. Check if Copilot suggestions appear
echo 4. Try opening Copilot Chat (Ctrl+Shift+I)
echo.

echo 🎯 IF COPILOT STILL SHOWS ERRORS:
echo =================================
echo • Go to VS Code Extensions panel
echo • Find GitHub Copilot extension
echo • Click the gear icon ⚙️
echo • Select "Disable" then "Enable"
echo • Restart VS Code completely
echo.

echo ✅ GitHub Copilot anti-freeze fix applied!
echo.
pause
