#!/usr/bin/env pwsh

Write-Host "=== TESTING SPECIFIC ACCOUNT ACTIONS ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3005"

# Login as admin
$adminResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
    email = "admin@hambrianglory.lk"
    password = "198512345678"
} | ConvertTo-Json) -ContentType "application/json"

$adminToken = $adminResponse.token
$headers = @{ "Authorization" = "Bearer $adminToken" }

Write-Host "1. Getting users with account issues..." -ForegroundColor Yellow
$accountsResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Headers $headers

$lockedUsers = $accountsResponse.users | Where-Object { $_.isLocked -eq $true }
Write-Host "Found $($lockedUsers.Count) locked users" -ForegroundColor Cyan

if ($lockedUsers.Count -gt 0) {
    $testUser = $lockedUsers[0]
    Write-Host ""
    Write-Host "2. Testing unlock specific user: $($testUser.userId)" -ForegroundColor Yellow
    
    # Unlock the specific user
    $unlockResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
        action = "unlock"
        userId = $testUser.userId
    } | ConvertTo-Json) -ContentType "application/json"
    
    if ($unlockResponse.success) {
        Write-Host "✅ User unlock successful: $($unlockResponse.message)" -ForegroundColor Green
    } else {
        Write-Host "❌ User unlock failed!" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "3. Testing reset password to NIC for: $($testUser.userId)" -ForegroundColor Yellow
    
    # Get user details to get NIC
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/users" -Headers $headers
    $fullUser = $usersResponse.users | Where-Object { $_.id -eq $testUser.userId }
    
    if ($fullUser.nicNumber) {
        $resetResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
            action = "reset_password"
            userId = $testUser.userId
            nicNumber = $fullUser.nicNumber
        } | ConvertTo-Json) -ContentType "application/json"
        
        if ($resetResponse.success) {
            Write-Host "✅ Password reset successful: $($resetResponse.message)" -ForegroundColor Green
            
            # Test login with NIC password
            Write-Host ""
            Write-Host "4. Testing login with reset NIC password..." -ForegroundColor Yellow
            try {
                $loginTestResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
                    email = $fullUser.email
                    password = $fullUser.nicNumber
                } | ConvertTo-Json) -ContentType "application/json"
                
                if ($loginTestResponse.token) {
                    Write-Host "✅ Login with NIC password successful!" -ForegroundColor Green
                    Write-Host "User can now login with:" -ForegroundColor Cyan
                    Write-Host "  Email: $($fullUser.email)" -ForegroundColor White
                    Write-Host "  Password: $($fullUser.nicNumber)" -ForegroundColor White
                    if ($loginTestResponse.requiresPasswordChange) {
                        Write-Host "⚠️ User will be required to change password on first login" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "❌ Login test failed!" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Login test failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Password reset failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ No NIC number found for user" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "5. Final status check..." -ForegroundColor Yellow
$finalAccountsResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Headers $headers
Write-Host "Current users with issues: $($finalAccountsResponse.users.Count)" -ForegroundColor Cyan

foreach ($user in $finalAccountsResponse.users) {
    $status = ""
    if ($user.isLocked) { $status += "🔒 LOCKED " }
    if ($user.isTemporary) { $status += "🔑 TEMP_PASS " }
    if ($user.failedAttempts -gt 0) { $status += "⚠️ FAILED_ATTEMPTS($($user.failedAttempts)) " }
    
    Write-Host "  - $($user.userId): $status" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== ACCOUNT MANAGEMENT ACTIONS TEST COMPLETE ===" -ForegroundColor Cyan
