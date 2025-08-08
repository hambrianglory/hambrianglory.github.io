#!/usr/bin/env pwsh

Write-Host "🔍 WhatsApp Unauthorized Error - Diagnosis" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "The 'unauthorized' error occurs because:" -ForegroundColor Yellow
Write-Host "1. The WhatsApp session API requires admin authentication" -ForegroundColor White
Write-Host "2. Your JWT token may be expired or invalid" -ForegroundColor White
Write-Host "3. You may not be logged in as admin" -ForegroundColor White
Write-Host ""

Write-Host "🚀 QUICK FIX STEPS:" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Ensure you're logged in as admin" -ForegroundColor Yellow
Write-Host "• Go to: http://localhost:3000/admin" -ForegroundColor White
Write-Host "• Login with: admin@hambrianglory.lk / admin123" -ForegroundColor White
Write-Host "• Make sure you see the admin dashboard" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Start WAHA server (if not running)" -ForegroundColor Yellow
Write-Host "• Run: docker run --name waha-fix -d -p 3001:3000 devlikeapro/waha" -ForegroundColor White
Write-Host "• Wait 30 seconds for server to start" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Try WhatsApp session again" -ForegroundColor Yellow
Write-Host "• Go to WhatsApp tab in admin panel" -ForegroundColor White
Write-Host "• Click 'Start WhatsApp Session'" -ForegroundColor White
Write-Host "• Should work without unauthorized error" -ForegroundColor White
Write-Host ""

Write-Host "🔧 ALTERNATIVE FIX (if above doesn't work):" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "If still getting unauthorized error:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache and cookies" -ForegroundColor White
Write-Host "2. Log out and log back in" -ForegroundColor White
Write-Host "3. Check browser console (F12) for token errors" -ForegroundColor White
Write-Host ""

Write-Host "🧪 TEST THE FIX:" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Write-Host ""

# Start WAHA server
Write-Host "Starting WAHA server..." -ForegroundColor Blue
try {
    docker rm -f waha-fix 2>$null
    $containerId = docker run --name waha-fix -d -p 3001:3000 devlikeapro/waha 2>$null
    if ($containerId) {
        Write-Host "✅ WAHA server started successfully" -ForegroundColor Green
        Write-Host "   Container ID: $containerId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to start WAHA server" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Docker error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Wait 30 seconds, then test:" -ForegroundColor Yellow
Write-Host "1. Go to: http://localhost:3000/admin" -ForegroundColor White
Write-Host "2. Login as admin" -ForegroundColor White
Write-Host "3. Go to WhatsApp tab" -ForegroundColor White
Write-Host "4. Click 'Start WhatsApp Session'" -ForegroundColor White
Write-Host "5. Should see QR code message (no unauthorized error)" -ForegroundColor White
Write-Host ""

Write-Host "🎯 ROOT CAUSE:" -ForegroundColor Red
Write-Host "• WhatsApp API endpoints require admin JWT token" -ForegroundColor White
Write-Host "• Must be logged in as admin to start WhatsApp sessions" -ForegroundColor White
Write-Host "• Token gets stored in localStorage after admin login" -ForegroundColor White
Write-Host ""

Write-Host "✅ SOLUTION: Just ensure you're properly logged in as admin!" -ForegroundColor Green
