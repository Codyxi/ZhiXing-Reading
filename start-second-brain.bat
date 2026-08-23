@echo off
chcp 65001 >nul 2>&1
title ZhiXing

echo.
echo  ========================================
echo       ZhiXing
echo  ========================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    goto :fail
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js: %NODE_VER%

if not exist "node_modules" (
    echo [INFO] First run, installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        goto :fail
    )
    echo [OK] Dependencies installed.
) else (
    echo [OK] Dependencies ready.
)

echo.
echo [INFO] Starting dev server at http://localhost:3000
echo.

call npm run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Dev server crashed. Retrying npm install...
    call npm install
    call npm run dev
)

goto :end

:fail
echo.

:end
pause
