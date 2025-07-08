#!/usr/bin/env pwsh

Write-Host "🔐 Creating Admin Password..." -ForegroundColor Cyan

# Test login first with existing member account to verify system works
$baseUrl = "http://localhost:3005"

Write-Host "Step 1: Testing login system with known member account..." -ForegroundColor Yellow
try {
    $memberResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
        email = "profile@test.com"
        password = "test123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    if ($memberResponse.token) {
        Write-Host "✅ Login system is working!" -ForegroundColor Green
        Write-Host "Member login successful: $($memberResponse.user.name)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Login system issue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Setting up admin password using API..." -ForegroundColor Yellow

# Use the change password API with the admin's NIC number as current password
$adminId = "admin_1"
$adminNIC = "198512345678"
$newPassword = "admin123"

try {
    # Try to change password from NIC to admin123
    $changeResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/change-password" -Method POST -Body (@{
        userId = $adminId
        currentPassword = $adminNIC
        newPassword = $newPassword
    } | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "✅ Admin password set successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Direct password change failed, trying login with NIC..." -ForegroundColor Yellow
    
    # Try login with NIC first to see if that works
    try {
        $adminLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
            email = "admin@hambrianglory.lk"
            password = $adminNIC
        } | ConvertTo-Json) -ContentType "application/json"
        
        if ($adminLoginResponse.token) {
            Write-Host "✅ Admin can login with NIC!" -ForegroundColor Green
            Write-Host "Admin credentials:" -ForegroundColor Cyan
            Write-Host "  Email: admin@hambrianglory.lk" -ForegroundColor White
            Write-Host "  Password: $adminNIC" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ Admin login with NIC failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Step 3: Testing all possible admin emails..." -ForegroundColor Yellow

$adminEmails = @(
    "admin",
    "admin@hambrianglory.lk", 
    "admin@community.com",
    "admin@test.com",
    "admin@admin.com"
)

$adminPasswords = @("admin", "admin123", $adminNIC)

foreach ($email in $adminEmails) {
    foreach ($password in $adminPasswords) {
        try {
            $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
                email = $email
                password = $password
            } | ConvertTo-Json) -ContentType "application/json"
            
            if ($testResponse.token -and $testResponse.user.role -eq "admin") {
                Write-Host "🎯 WORKING ADMIN CREDENTIALS FOUND!" -ForegroundColor Green
                Write-Host "  Email: $email" -ForegroundColor Cyan
                Write-Host "  Password: $password" -ForegroundColor Cyan
                Write-Host "  User: $($testResponse.user.name)" -ForegroundColor Green
                exit 0
            }
        } catch {
            # Silently continue testing
        }
    }
}

Write-Host "❌ No working admin credentials found!" -ForegroundColor Red
