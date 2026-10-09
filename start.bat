@echo off
title Starlight Anime Pomodoro
echo ==========================================================
echo    Dang khoi chay Starlight Anime Pomodoro Timer...
echo ==========================================================

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python server.py
    pause
    exit /b
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node server.js
    pause
    exit /b
)

echo Khong tim thay Python hoac Node.js, dang mo truc tiep index.html...
start index.html
pause
