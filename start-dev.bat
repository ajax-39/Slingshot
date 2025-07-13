@echo off
echo Starting Ajax NSE Stock Manager...
echo.

echo [1/2] Starting backend server...
cd server
start "Ajax Backend" cmd /k "npm run dev"
cd ..

echo [2/2] Starting frontend development server...
timeout /t 3 /nobreak > nul
npm run dev

echo.
echo Both servers are starting up!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
pause
