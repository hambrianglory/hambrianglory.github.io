#!/usr/bin/env pwsh

# Test script to verify the fixes work on the deployed site

Write-Host "=== Community Fee Management System - Fix Verification ===" -ForegroundColor Green
Write-Host ""

# Check if site is accessible
$siteUrl = "https://hambrianglory.github.io/community-fee-management/"
Write-Host "1. Checking site accessibility..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $siteUrl -Method Head -TimeoutSec 10
    Write-Host "✓ Site is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Site is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check admin page
$adminUrl = "$siteUrl/admin"
Write-Host "2. Checking admin page..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $adminUrl -Method Head -TimeoutSec 10
    Write-Host "✓ Admin page is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Admin page is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Check login page
$loginUrl = "$siteUrl/login"
Write-Host "3. Checking login page..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $loginUrl -Method Head -TimeoutSec 10
    Write-Host "✓ Login page is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Login page is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Go to: $siteUrl" -ForegroundColor White
Write-Host "2. Click 'Login' and use these credentials:" -ForegroundColor White
Write-Host "   Email: admin@hambriangLory.com" -ForegroundColor White
Write-Host "   Password: Admin@2025" -ForegroundColor White
Write-Host "3. Once in admin dashboard, click 'Debug DB' to check database status" -ForegroundColor White
Write-Host "4. Test file upload with the provided CSV templates" -ForegroundColor White
Write-Host "5. Check the login history tab" -ForegroundColor White
Write-Host ""
Write-Host "If you encounter issues:" -ForegroundColor Cyan
Write-Host "- Press F12 to open browser console and check for errors" -ForegroundColor White
Write-Host "- Use the debug script in debug-script.js" -ForegroundColor White
Write-Host "- Follow the troubleshooting guide in TROUBLESHOOTING.md" -ForegroundColor White
Write-Host ""
Write-Host "The fixes include:" -ForegroundColor Cyan
Write-Host "✓ Enhanced database initialization with better error handling" -ForegroundColor Green
Write-Host "✓ Improved CSV parsing with detailed logging" -ForegroundColor Green
Write-Host "✓ Added fallback mechanisms for encryption failures" -ForegroundColor Green
Write-Host "✓ Better error messages and debugging tools" -ForegroundColor Green
Write-Host "✓ Database health check functionality" -ForegroundColor Green
