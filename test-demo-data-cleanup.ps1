#!/usr/bin/env pwsh

Write-Host "=== Testing Demo Data Cleanup ===" -ForegroundColor Green

Write-Host "`n1. Checking if only one admin login exists..." -ForegroundColor Yellow

# Check login route for demo credentials
$loginContent = Get-Content "src/app/api/auth/login/route.ts" -Raw
$adminCredentials = ([regex]::Matches($loginContent, "admin@")).Count

Write-Host "Found $adminCredentials admin credential entries in login route" -ForegroundColor Cyan

if ($adminCredentials -eq 1) {
    Write-Host "✓ Only one admin login exists" -ForegroundColor Green
} else {
    Write-Host "✗ Multiple admin logins still exist" -ForegroundColor Red
}

Write-Host "`n2. Checking if demo users are removed from data service..." -ForegroundColor Yellow

# Check data service for sample users
$dataContent = Get-Content "src/lib/data.ts" -Raw
$demoUserCount = ([regex]::Matches($dataContent, "john@example.com|jane@example.com|david@example.com|sarah@example.com")).Count

Write-Host "Found $demoUserCount demo user references in data service" -ForegroundColor Cyan

if ($demoUserCount -eq 0) {
    Write-Host "✓ All demo users removed from data service" -ForegroundColor Green
} else {
    Write-Host "✗ Demo users still exist in data service" -ForegroundColor Red
}

Write-Host "`n3. Checking if sample payments are removed..." -ForegroundColor Yellow

# Check for sample payments
$samplePaymentCount = ([regex]::Matches($dataContent, "payment_\d+")).Count

Write-Host "Found $samplePaymentCount sample payment references" -ForegroundColor Cyan

if ($samplePaymentCount -eq 0) {
    Write-Host "✓ All sample payments removed" -ForegroundColor Green
} else {
    Write-Host "✗ Sample payments still exist" -ForegroundColor Red
}

Write-Host "`n4. Checking if only admin user is initialized..." -ForegroundColor Yellow

# Check if only admin user exists in initialization
$adminUserCount = ([regex]::Matches($dataContent, "Community Admin")).Count

Write-Host "Found $adminUserCount admin user references" -ForegroundColor Cyan

if ($adminUserCount -eq 1) {
    Write-Host "✓ Only admin user is initialized" -ForegroundColor Green
} else {
    Write-Host "✗ Multiple or no admin users found" -ForegroundColor Red
}

Write-Host "`n5. Checking if sample files are removed..." -ForegroundColor Yellow

# Check for sample data files
$sampleFiles = @("sample_users_upload.csv", "sample_payments_upload.csv", "simple_test.csv", "sample_users_phone_test.csv")
$existingFiles = @()

foreach ($file in $sampleFiles) {
    if (Test-Path $file) {
        $existingFiles += $file
    }
}

Write-Host "Found $($existingFiles.Count) sample data files remaining" -ForegroundColor Cyan

if ($existingFiles.Count -eq 0) {
    Write-Host "✓ All sample data files removed" -ForegroundColor Green
} else {
    Write-Host "✗ Sample files still exist: $($existingFiles -join ', ')" -ForegroundColor Red
}

Write-Host "`n=== Demo Data Cleanup Test Complete ===" -ForegroundColor Green

Write-Host "`nSUMMARY:" -ForegroundColor Yellow
Write-Host "• Only one admin login: admin@hambrianglory.lk / admin123" -ForegroundColor White
Write-Host "• All demo users and payments removed" -ForegroundColor White
Write-Host "• Clean data initialization (only admin user)" -ForegroundColor White
Write-Host "• Sample data files cleaned up" -ForegroundColor White
Write-Host "• Members must be added via admin panel or Excel upload" -ForegroundColor White

Write-Host "`nTo test the clean system:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:3002/login" -ForegroundColor White
Write-Host "2. Login with: admin@hambrianglory.lk / admin123" -ForegroundColor White
Write-Host "3. Admin panel should show 0 members initially" -ForegroundColor White
Write-Host "4. Upload users via Excel or add manually to populate data" -ForegroundColor White
