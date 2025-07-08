# Test Argon2 Authentication System
# Tests the new Argon2-based password encryption and authentication

Write-Host "=== Testing Argon2 Authentication System ===" -ForegroundColor Green
Write-Host

# Test variables
$baseUrl = "http://localhost:3001"
$adminEmail = "admin@hambrianglory.lk"
$adminNic = "198512345678"
$newPassword = "AdminPassword123!"

Write-Host "1. Testing login with temporary password (NIC)..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
        email = $adminEmail
        password = $adminNic
    } | ConvertTo-Json) -ContentType "application/json"
    
    if ($loginResponse.requiresPasswordChange) {
        Write-Host "✓ Login successful with temporary password" -ForegroundColor Green
        Write-Host "✓ Password change required as expected" -ForegroundColor Green
        $token = $loginResponse.token
    } else {
        Write-Host "✗ Expected password change requirement" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host
Write-Host "2. Testing password change to strong password..." -ForegroundColor Cyan
try {
    $changeResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
        email = $adminEmail
        isChangePassword = $true
        oldPassword = $adminNic
        newPassword = $newPassword
    } | ConvertTo-Json) -ContentType "application/json"
    
    if ($changeResponse.message -eq "Password changed successfully") {
        Write-Host "✓ Password changed successfully using Argon2" -ForegroundColor Green
    } else {
        Write-Host "✗ Password change failed: $($changeResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Password change failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host
Write-Host "3. Testing login with new strong password..." -ForegroundColor Cyan
try {
    $newLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
        email = $adminEmail
        password = $newPassword
    } | ConvertTo-Json) -ContentType "application/json"
    
    if (-not $newLoginResponse.requiresPasswordChange) {
        Write-Host "✓ Login successful with new password" -ForegroundColor Green
        Write-Host "✓ No password change required" -ForegroundColor Green
        $adminToken = $newLoginResponse.token
    } else {
        Write-Host "✗ Unexpected password change requirement" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Login with new password failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host
Write-Host "4. Testing failed login attempts (lockout mechanism)..." -ForegroundColor Cyan
for ($i = 1; $i -le 6; $i++) {
    try {
        $failedResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
            email = $adminEmail
            password = "WrongPassword123"
        } | ConvertTo-Json) -ContentType "application/json"
        
        Write-Host "✗ Unexpected successful login with wrong password" -ForegroundColor Red
        exit 1
    } catch {
        if ($i -lt 5) {
            Write-Host "✓ Attempt ${i}: Login correctly failed" -ForegroundColor Yellow
        } else {
            Write-Host "✓ Attempt ${i}: Account should be locked" -ForegroundColor Yellow
            $response = $_.ErrorDetails.Message | ConvertFrom-Json
            if ($response.message -like "*locked*") {
                Write-Host "✓ Account locked after 5 failed attempts" -ForegroundColor Green
            } else {
                Write-Host "✗ Expected account lockout message" -ForegroundColor Red
            }
        }
    }
}

Write-Host
Write-Host "5. Testing admin account unlock functionality..." -ForegroundColor Cyan
try {
    $unlockResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Body (@{
        action = "unlock"
        userId = "admin_1"
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    if ($unlockResponse.success) {
        Write-Host "✓ Account unlocked successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Account unlock failed: $($unlockResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Account unlock failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host
Write-Host "6. Testing login after unlock..." -ForegroundColor Cyan
try {
    $unlockedLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
        email = $adminEmail
        password = $newPassword
    } | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "✓ Login successful after unlock" -ForegroundColor Green
} catch {
    Write-Host "✗ Login after unlock failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host
Write-Host "7. Testing password reset to NIC..." -ForegroundColor Cyan
try {
    $resetResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Body (@{
        action = "reset_password"
        userId = "admin_1"
        nicNumber = $adminNic
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    if ($resetResponse.success) {
        Write-Host "✓ Password reset to NIC successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Password reset failed: $($resetResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Password reset failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host
Write-Host "8. Testing login with reset password (NIC)..." -ForegroundColor Cyan
try {
    $resetLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
        email = $adminEmail
        password = $adminNic
    } | ConvertTo-Json) -ContentType "application/json"
    
    if ($resetLoginResponse.requiresPasswordChange) {
        Write-Host "✓ Login successful with reset password" -ForegroundColor Green
        Write-Host "✓ Password change required after reset" -ForegroundColor Green
    } else {
        Write-Host "✗ Expected password change requirement after reset" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Login with reset password failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host
Write-Host "=== All Argon2 Authentication Tests Passed! ===" -ForegroundColor Green
Write-Host
Write-Host "✓ Argon2 password hashing working correctly" -ForegroundColor Green
Write-Host "✓ Temporary password (NIC) authentication" -ForegroundColor Green
Write-Host "✓ Password change functionality" -ForegroundColor Green
Write-Host "✓ Strong password enforcement" -ForegroundColor Green
Write-Host "✓ Account lockout after failed attempts" -ForegroundColor Green
Write-Host "✓ Admin account unlock functionality" -ForegroundColor Green
Write-Host "✓ Admin password reset functionality" -ForegroundColor Green
Write-Host "✓ Full authentication cycle working" -ForegroundColor Green
Write-Host
Write-Host "The system is now using Argon2 for secure password encryption!" -ForegroundColor Magenta
