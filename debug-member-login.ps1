#!/usr/bin/env pwsh
# Debug Member Login Issues

Write-Host "🔍 Debugging Member Login Issues..." -ForegroundColor Green
Write-Host ""

# Check if the app is running
$port3000 = netstat -an | findstr ":3000"
if ($port3000) {
    Write-Host "✅ App is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ App is not running. Starting server..." -ForegroundColor Red
    Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
    
    # Start server in background
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "." -WindowStyle Hidden
    
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "🧪 Member Login Test Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 👨‍💼 Login as Admin first:" -ForegroundColor White
Write-Host "   📧 Email: admin@hambriangLory.com" -ForegroundColor Gray
Write-Host "   🔑 Password: Admin@2025" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ➕ Add a Test Member:" -ForegroundColor White
Write-Host "   📧 Email: test@example.com" -ForegroundColor Gray
Write-Host "   📱 Phone: 771234567" -ForegroundColor Gray
Write-Host "   🆔 NIC: 123456789V" -ForegroundColor Gray
Write-Host "   📝 Name: Test User" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚪 Logout from Admin" -ForegroundColor White
Write-Host ""
Write-Host "4. 👤 Try Member Login:" -ForegroundColor White
Write-Host "   📧 Email: test@example.com" -ForegroundColor Gray
Write-Host "   🔑 Password: 123456789V (the NIC number)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Debug Features Added:" -ForegroundColor Yellow
Write-Host "✅ Authentication debug logging in console" -ForegroundColor Green
Write-Host "✅ User creation logging" -ForegroundColor Green
Write-Host "✅ Password validation improvements" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Opening login page..." -ForegroundColor Green

# Open browser to login page
Start-Process "http://localhost:3000/login"

Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Cyan
Write-Host "1. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "2. Check the Console tab for debug messages" -ForegroundColor White
Write-Host "3. Follow the test steps above" -ForegroundColor White
Write-Host "4. Look for authentication debug info in console" -ForegroundColor White
Write-Host ""
Write-Host "🎯 If member login still fails, check the console for:" -ForegroundColor Yellow
Write-Host "   - User found: true/false" -ForegroundColor Gray
Write-Host "   - User role: member/admin" -ForegroundColor Gray
Write-Host "   - NIC number matches password" -ForegroundColor Gray
Write-Host "   - Authentication result" -ForegroundColor Gray

Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Red
Read-Host
