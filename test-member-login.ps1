#!/usr/bin/env pwsh
# Test Member Login Functionality

Write-Host "🧪 Testing Member Login Functionality..." -ForegroundColor Green
Write-Host ""

# First, let's check if there are any members in the system
Write-Host "📋 Checking existing members..." -ForegroundColor Yellow

# Start the development server in the background
Write-Host "🚀 Starting development server..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "d:\Downloads\System\community-fee-management" -PassThru

# Wait a moment for server to start
Start-Sleep -Seconds 10

Write-Host "🌐 Server should be running at http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "🔐 Login Test Instructions:" -ForegroundColor Cyan
Write-Host "1. Admin Login:" -ForegroundColor White
Write-Host "   Email: admin@hambriangLory.com" -ForegroundColor Gray
Write-Host "   Password: Admin@2025" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Member Login (after adding a member):" -ForegroundColor White
Write-Host "   Email: [member's email]" -ForegroundColor Gray
Write-Host "   Password: [member's NIC number]" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Test Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000/login" -ForegroundColor White
Write-Host "2. Login as admin using credentials above" -ForegroundColor White
Write-Host "3. Go to Admin Panel → Add a new member" -ForegroundColor White
Write-Host "4. Note the member's email and NIC number" -ForegroundColor White
Write-Host "5. Logout and try logging in as the member" -ForegroundColor White
Write-Host "6. Use member's email and NIC as password" -ForegroundColor White
Write-Host ""
Write-Host "✨ New Features to Test:" -ForegroundColor Green
Write-Host "📱 Phone auto-formatting (+94)" -ForegroundColor White
Write-Host "✅ Bulk member selection/delete" -ForegroundColor White
Write-Host "📊 Excel export functionality" -ForegroundColor White
Write-Host "🔄 Dynamic real-time updates" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to open browser or Ctrl+C to exit..." -ForegroundColor Red
Read-Host

# Open browser
Start-Process "http://localhost:3000/login"

Write-Host "🎯 Browser opened! Happy testing!" -ForegroundColor Green
