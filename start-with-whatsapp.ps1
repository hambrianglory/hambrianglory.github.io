#!/usr/bin/env pwsh
# Community Fee Management System with WhatsApp Integration

Write-Host "🚀 Starting Community Fee Management System with WhatsApp..." -ForegroundColor Green
Write-Host ""

# Change to project directory
Set-Location "d:\Downloads\System\community-fee-management"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🏗️  Building project..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "🔥 NEW FEATURE: WhatsApp Integration!" -ForegroundColor Cyan
Write-Host "✅ Send payment reminders to overdue members" -ForegroundColor White
Write-Host "✅ Send custom messages to selected members" -ForegroundColor White  
Write-Host "✅ Send welcome messages to new members" -ForegroundColor White
Write-Host "✅ Bulk operations with success tracking" -ForegroundColor White
Write-Host ""

Write-Host "� Checking Docker availability..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
        Write-Host "�📋 WhatsApp Setup Instructions:" -ForegroundColor Yellow
        Write-Host "1. This script will start your main app" -ForegroundColor White
        Write-Host "2. In a NEW terminal, run: docker run -it -p 3000:3000/tcp devlikeapro/waha" -ForegroundColor White
        Write-Host "3. Login to admin → WhatsApp tab" -ForegroundColor White
        Write-Host "4. Click 'Start WhatsApp Session' and scan QR code" -ForegroundColor White
        Write-Host "5. Test sending payment reminders!" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Docker not found!" -ForegroundColor Red
    Write-Host "📋 To enable WhatsApp features:" -ForegroundColor Yellow
    Write-Host "1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Restart computer after installation" -ForegroundColor White
    Write-Host "3. Run: docker run -it -p 3000:3000/tcp devlikeapro/waha" -ForegroundColor White
    Write-Host "4. WhatsApp features are ready but need WAHA server" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See DOCKER_ALTERNATIVES.md for other options" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "🌐 Starting development server..." -ForegroundColor Green
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "   🏠 Main App: http://localhost:3000" -ForegroundColor White
Write-Host "   👨‍💼 Admin Panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host "   📱 WAHA (after setup): http://localhost:3000" -ForegroundColor White
Write-Host "   🔐 Admin Login: admin@hambriangLory.com / Admin@2025" -ForegroundColor White
Write-Host ""
Write-Host "✨ All Features Available:" -ForegroundColor Green
Write-Host "   📱 Phone auto-formatting (+94)" -ForegroundColor White
Write-Host "   ✅ Bulk member selection/delete" -ForegroundColor White
Write-Host "   📊 Excel export functionality" -ForegroundColor White
Write-Host "   🔄 Dynamic real-time updates" -ForegroundColor White
Write-Host "   💬 WhatsApp payment reminders" -ForegroundColor White
Write-Host "   📢 WhatsApp custom messages" -ForegroundColor White
Write-Host "   🎉 WhatsApp welcome messages" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to continue or Ctrl+C to exit..." -ForegroundColor Red
Read-Host

# Start the development server
npm run dev
