#!/usr/bin/env pwsh
# Community Fee Management System Startup Script

Write-Host "🚀 Starting Community Fee Management System..." -ForegroundColor Green
Write-Host "📍 Working Directory: $(Get-Location)" -ForegroundColor Cyan

# Change to the project directory
Set-Location "d:\Downloads\System\community-fee-management"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🏗️  Building project..." -ForegroundColor Yellow
npm run build

Write-Host "🌐 Starting development server..." -ForegroundColor Green
Write-Host "📋 Access the application at:" -ForegroundColor Cyan
Write-Host "   🏠 Main App: http://localhost:3000" -ForegroundColor White
Write-Host "   👨‍💼 Admin Panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host "   🔐 Admin Login: admin@hambriangLory.com / Admin@2025" -ForegroundColor White
Write-Host ""
Write-Host "✨ Features Available:" -ForegroundColor Green
Write-Host "   📱 Phone auto-formatting (+94)" -ForegroundColor White
Write-Host "   ✅ Bulk member selection/delete" -ForegroundColor White
Write-Host "   📊 Excel export functionality" -ForegroundColor White
Write-Host "   🔄 Dynamic real-time updates" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red

# Start the development server
npm run dev
