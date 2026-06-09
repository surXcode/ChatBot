@echo off
title FAQ Assistant - Setup ^& Run
color 0A

echo.
echo  ==========================================
echo   FAQ Assistant - Windows Setup ^& Launcher
echo  ==========================================
echo.

:: ── Check Node.js ──────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed.
    echo.
    echo  Please download and install it from:
    echo  https://nodejs.org  (choose the LTS version)
    echo.
    echo  After installing, close this window and run START.bat again.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% found

:: ── Check npm ──────────────────────────────────────────────────────────────
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] npm not found. Reinstall Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo  [OK] npm found

:: ── .env setup ─────────────────────────────────────────────────────────────
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo.
    echo  ============================================================
    echo   FIRST-TIME SETUP: Enter your Anthropic API key
    echo   Get one free at: https://console.anthropic.com
    echo  ============================================================
    echo.
    set /p API_KEY=" Paste your API key here: "
    
    :: Write the .env file
    (
        echo ANTHROPIC_API_KEY=!API_KEY!
        echo MONGODB_URI=mongodb://localhost:27017/faq-assistant
        echo PORT=5000
        echo FRONTEND_URL=http://localhost:5173
    ) > backend\.env
    echo.
    echo  [OK] API key saved to backend\.env
) else (
    echo  [OK] backend\.env already exists
)

:: ── Install backend dependencies ────────────────────────────────────────────
echo.
echo  Installing backend packages...
cd backend
call npm install --silent
if %errorlevel% neq 0 (
    echo  [ERROR] Backend install failed. Check your internet connection.
    pause
    exit /b 1
)
cd ..
echo  [OK] Backend packages ready

:: ── Install frontend dependencies ───────────────────────────────────────────
echo.
echo  Installing frontend packages...
cd frontend
call npm install --silent
if %errorlevel% neq 0 (
    echo  [ERROR] Frontend install failed. Check your internet connection.
    pause
    exit /b 1
)
cd ..
echo  [OK] Frontend packages ready

:: ── Check / start MongoDB ───────────────────────────────────────────────────
echo.
echo  Checking MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    sc start MongoDB >nul 2>&1
    echo  [OK] MongoDB service started
) else (
    :: Try mongod directly (manual install)
    where mongod >nul 2>&1
    if %errorlevel% equ 0 (
        echo  Starting MongoDB manually...
        if not exist "%USERPROFILE%\data\db" mkdir "%USERPROFILE%\data\db"
        start "MongoDB" /min mongod --dbpath "%USERPROFILE%\data\db" --quiet
        timeout /t 3 /nobreak >nul
        echo  [OK] MongoDB started
    ) else (
        echo.
        echo  [WARNING] MongoDB not found as a service or on PATH.
        echo  The app needs MongoDB to save conversations.
        echo.
        echo  Option A: Install MongoDB from https://www.mongodb.com/try/download/community
        echo            (check "Install as a Service" during setup)
        echo.
        echo  Option B: Use Docker instead - run DOCKER-START.bat
        echo.
        set /p SKIP="  Continue anyway? (y/n): "
        if /i not "!SKIP!"=="y" exit /b 1
    )
)

:: ── Launch backend ──────────────────────────────────────────────────────────
echo.
echo  Starting backend server...
start "FAQ Backend" cmd /k "cd /d "%~dp0backend" && echo Starting backend... && npm start"
timeout /t 3 /nobreak >nul

:: ── Launch frontend ─────────────────────────────────────────────────────────
echo  Starting frontend...
start "FAQ Frontend" cmd /k "cd /d "%~dp0frontend" && echo Starting frontend... && npm run dev"
timeout /t 5 /nobreak >nul

:: ── Open browser ────────────────────────────────────────────────────────────
echo  Opening browser...
start http://localhost:5173

echo.
echo  ==========================================
echo   App is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo  ==========================================
echo.
echo  Two terminal windows have opened (Backend + Frontend).
echo  Close them to stop the app.
echo.
pause
