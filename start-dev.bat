@echo off
REM WSEI Communicator - Quick Start Script for Windows
REM This script starts both the backend and frontend development servers

color 0B
echo.
echo ========================================
echo Starting WSEI Communicator Development
echo ========================================
echo.

REM Check if MongoDB is running by trying to connect
echo Checking MongoDB connection on localhost:27017...
netstat -an | find ":27017" >nul
if %errorlevel% neq 0 (
    echo.
    color 0C
    echo WARNING: MongoDB is not running on localhost:27017
    echo Please start MongoDB before continuing.
    echo For Docker: docker run -d -p 27017:27017 mongo
    echo.
    pause
    exit /b 1
)

color 0B
echo.
echo Starting backend server...
cd wsei-communicator-server

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
)

start "WSEI Backend" npm start
timeout /t 3 /nobreak

echo.
echo Starting frontend development server...
cd ..\wsei-communicator-client

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
)

start "WSEI Frontend" npm run dev

echo.
echo ========================================
echo Development servers are starting!
echo ========================================
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Close this window to stop the servers.
echo.

pause
