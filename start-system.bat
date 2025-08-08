@echo off
title Community Fee Management System
echo.
echo ========================================
echo   Community Fee Management System
echo ========================================
echo.
echo Starting the application...

cd /d "d:\Downloads\System\community-fee-management"

echo.
echo Installing dependencies...
call npm install

echo.
echo Building project...
call npm run build

echo.
echo Starting development server...
echo.
echo Access the application at:
echo   Main App: http://localhost:3000
echo   Admin Panel: http://localhost:3000/admin
echo   Admin Login: admin@hambriangLory.com / Admin@2025
echo.
echo Features Available:
echo   - Phone auto-formatting (+94)
echo   - Bulk member selection/delete
echo   - Excel export functionality  
echo   - Dynamic real-time updates
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
