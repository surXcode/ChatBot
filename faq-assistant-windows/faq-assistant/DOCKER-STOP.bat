@echo off
title FAQ Assistant - Stop
color 0C
echo.
echo  Stopping FAQ Assistant...
docker-compose down
echo.
echo  [OK] All services stopped.
pause
