@echo off
title FAQ Assistant - Docker Start
color 0B

echo.
echo  ==========================================
echo   FAQ Assistant - Docker Launcher
echo   (No MongoDB install needed)
echo  ==========================================
echo.

:: Check Docker
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Docker Desktop is not installed.
    echo.
    echo  Download from: https://www.docker.com/products/docker-desktop
    echo  Install it, start Docker Desktop, then run this script again.
    pause
    exit /b 1
)

:: Check Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Docker Desktop is not running.
    echo  Please start Docker Desktop from your taskbar, wait for it to load,
    echo  then run this script again.
    pause
    exit /b 1
)
echo  [OK] Docker is running

:: Get API key
if not exist ".env" (
    echo.
    echo  ============================================================
    echo   Enter your Anthropic API key
    echo   Get one free at: https://console.anthropic.com
    echo  ============================================================
    echo.
    set /p API_KEY=" Paste your API key: "
    echo ANTHROPIC_API_KEY=!API_KEY!> .env
    echo  [OK] Saved to .env
) else (
    echo  [OK] .env already exists
)

echo.
echo  Building and starting all services (first run may take a few minutes)...
echo.
docker-compose --env-file .env up --build -d

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Docker failed. Check the output above.
    pause
    exit /b 1
)

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo  ==========================================
echo   App is running at http://localhost:3000
echo  ==========================================
echo.
echo  To stop:  run DOCKER-STOP.bat
echo.
pause
