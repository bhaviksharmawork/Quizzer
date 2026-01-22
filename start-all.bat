@echo off
echo Starting Quiz App Server and Android Emulator...
echo.

REM Start the server in a new window
start "Quiz Server" cmd /k "cd /d %~dp0 && node server.js"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start the Expo development server
start "Expo Dev Server" cmd /k "cd /d %~dp0 && npx expo start"

echo.
echo Server and Expo are starting...
echo Open your Expo Go app and scan the QR code to run the quiz app!
echo.
echo Server URL: http://localhost:3000
echo Expo URL: http://localhost:8081
echo.
pause
