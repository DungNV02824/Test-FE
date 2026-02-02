@echo off
echo.
echo ====================================
echo Image Scanner - Quick Start
echo ====================================
echo.

echo Step 1: Starting MySQL Database...
cd backend
docker-compose up -d
timeout /t 5 /nobreak

echo.
echo Step 2: Installing Backend Dependencies...
call npm install
timeout /t 3 /nobreak

echo.
echo Step 3: Initializing Database...
call npx prisma migrate dev --name init
timeout /t 3 /nobreak

echo.
echo Step 4: Starting Backend Server...
echo Backend will start in a new window...
start cmd /k "npm run start:dev"
timeout /t 5 /nobreak

cd ..

echo.
echo Step 5: Building Frontend Extension...
call npm run build
timeout /t 3 /nobreak

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next Steps:
echo 1. Backend is running at: http://localhost:3001
echo 2. MySQL is running at: localhost:3306
echo 3. Extension is built in: dist/
echo.
echo To load extension in Chrome:
echo 1. Go to chrome://extensions/
echo 2. Enable "Developer mode"
echo 3. Click "Load unpacked"
echo 4. Select the "dist" folder
echo.
echo To configure WordPress:
echo 1. Edit backend/.env with your WordPress details
echo 2. Restart backend: npm run start:dev (in backend folder)
echo.
