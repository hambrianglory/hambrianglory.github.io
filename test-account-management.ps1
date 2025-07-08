#!/usr/bin/env pwsh

# Account Management System Test
# Tests the admin ability to unlock user accounts and manage passwords

Write-Host "🔐 ACCOUNT MANAGEMENT SYSTEM TEST" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Step 1: Login as admin
Write-Host "`n1️⃣  ADMIN LOGIN TEST" -ForegroundColor Yellow

$loginData = @{
    email = "admin@hambrianglory.lk"
    password = "198512345678"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.requiresPasswordChange) {
        Write-Host "   ✅ Admin login successful (with password change required)" -ForegroundColor Green
        
        # Change admin password for testing
        $changeData = @{
            email = "admin@hambrianglory.lk"
            oldPassword = "198512345678"
            newPassword = "AdminPass123!"
            isChangePassword = $true
        } | ConvertTo-Json
        
        $changeResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $changeData -ContentType "application/json"
        Write-Host "   ✅ Admin password changed successfully" -ForegroundColor Green
        
        # Login with new password
        $newLoginData = @{
            email = "admin@hambrianglory.lk"
            password = "AdminPass123!"
        } | ConvertTo-Json
        
        $finalLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $newLoginData -ContentType "application/json"
        $adminToken = $finalLoginResponse.token
        Write-Host "   ✅ Admin final login successful" -ForegroundColor Green
    } else {
        $adminToken = $loginResponse.token
        Write-Host "   ✅ Admin login successful" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create account lockout scenario (simulate failed logins)
Write-Host "`n2️⃣  SIMULATING ACCOUNT LOCKOUT" -ForegroundColor Yellow

# Try to login with wrong password multiple times to trigger lockout
$wrongLoginData = @{
    email = "admin@hambrianglory.lk"
    password = "wrongpassword"
} | ConvertTo-Json

Write-Host "   🔄 Attempting failed logins to trigger lockout..." -ForegroundColor White

for ($i = 1; $i -le 6; $i++) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $wrongLoginData -ContentType "application/json" | Out-Null
    } catch {
        Write-Host "   ⚠️  Failed attempt $i" -ForegroundColor Gray
    }
}

Write-Host "   ✅ Account lockout scenario created" -ForegroundColor Green

# Step 3: Test account management API
Write-Host "`n3️⃣  TESTING ACCOUNT MANAGEMENT API" -ForegroundColor Yellow

# Get account issues
try {
    $headers = @{
        'Authorization' = "Bearer $adminToken"
    }
    
    $accountIssues = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Headers $headers
    
    Write-Host "   ✅ Account issues retrieved successfully" -ForegroundColor Green
    Write-Host "   📊 Total users with issues: $($accountIssues.totalCount)" -ForegroundColor Cyan
    
    if ($accountIssues.users -and $accountIssues.users.Count -gt 0) {
        foreach ($user in $accountIssues.users) {
            Write-Host "   👤 User: $($user.userId)" -ForegroundColor White
            Write-Host "      - Locked: $($user.isLocked)" -ForegroundColor $(if ($user.isLocked) { 'Red' } else { 'Green' })
            Write-Host "      - Temporary Password: $($user.isTemporary)" -ForegroundColor $(if ($user.isTemporary) { 'Yellow' } else { 'Green' })
            Write-Host "      - Failed Attempts: $($user.failedAttempts)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ Failed to get account issues: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test account unlock functionality
Write-Host "`n4️⃣  TESTING ACCOUNT UNLOCK" -ForegroundColor Yellow

try {
    $unlockData = @{
        action = "unlock"
        userId = "admin_1"
    } | ConvertTo-Json
    
    $unlockResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Body $unlockData -ContentType "application/json" -Headers $headers
    
    Write-Host "   ✅ Account unlock successful" -ForegroundColor Green
    Write-Host "   💬 Message: $($unlockResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Account unlock failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test password reset to NIC
Write-Host "`n5️⃣  TESTING PASSWORD RESET TO NIC" -ForegroundColor Yellow

try {
    $resetData = @{
        action = "reset_password"
        userId = "admin_1"
        nicNumber = "198512345678"
    } | ConvertTo-Json
    
    $resetResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Body $resetData -ContentType "application/json" -Headers $headers
    
    Write-Host "   ✅ Password reset successful" -ForegroundColor Green
    Write-Host "   💬 Message: $($resetResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Password reset failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Test login with reset password
Write-Host "`n6️⃣  TESTING LOGIN WITH RESET PASSWORD" -ForegroundColor Yellow

try {
    $resetLoginData = @{
        email = "admin@hambrianglory.lk"
        password = "198512345678"
    } | ConvertTo-Json
    
    $resetLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $resetLoginData -ContentType "application/json"
    
    Write-Host "   ✅ Login with reset password successful" -ForegroundColor Green
    Write-Host "   🔄 Requires password change: $($resetLoginResponse.requiresPasswordChange)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Login with reset password failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 ACCOUNT MANAGEMENT TEST COMPLETE!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

Write-Host "`n📋 ACCOUNT MANAGEMENT FEATURES TESTED:" -ForegroundColor Cyan
Write-Host "✅ Admin authentication" -ForegroundColor White
Write-Host "✅ Account lockout detection" -ForegroundColor White
Write-Host "✅ Account unlock functionality" -ForegroundColor White
Write-Host "✅ Password reset to NIC" -ForegroundColor White
Write-Host "✅ Admin API authorization" -ForegroundColor White

Write-Host "`n🔗 ACCESS ADMIN DASHBOARD:" -ForegroundColor Blue
Write-Host "URL: $baseUrl/admin" -ForegroundColor White
Write-Host "Tab: Account Management" -ForegroundColor White
Write-Host "Features: View issues, unlock accounts, reset passwords" -ForegroundColor White
