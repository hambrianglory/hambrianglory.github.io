#!/usr/bin/env pwsh

Write-Host "=== ACCOUNT MANAGEMENT FEATURES TEST ===" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:3005"

# Admin credentials
$adminEmail = "admin@hambrianglory.lk"
$adminPassword = "198512345678"

# Function to make HTTP requests
function Invoke-WebRequestWithErrorHandling {
    param($Uri, $Method = "GET", $Headers = @{}, $Body = $null)
    
    try {
        if ($Body) {
            return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ContentType "application/json"
        } else {
            return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers
        }
    } catch {
        Write-Host "Error making request to $Uri : $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Red
        }
        return $null
    }
}

# Step 1: Login as admin
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequestWithErrorHandling -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json)

if (-not $loginResponse -or -not $loginResponse.token) {
    Write-Host "❌ Admin login failed!" -ForegroundColor Red
    exit 1
}

$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "✅ Admin login successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Get account issues
Write-Host "2. Getting account issues..." -ForegroundColor Yellow
$accountsResponse = Invoke-WebRequestWithErrorHandling -Uri "$baseUrl/api/admin/accounts" -Headers $headers

if ($accountsResponse) {
    Write-Host "✅ Account issues retrieved!" -ForegroundColor Green
    Write-Host "Total users with issues: $($accountsResponse.users.Count)" -ForegroundColor Cyan
    
    foreach ($user in $accountsResponse.users) {
        Write-Host "  - User: $($user.userId)" -ForegroundColor White
        Write-Host "    Name: $($user.user.name)" -ForegroundColor Gray
        Write-Host "    Email: $($user.user.email)" -ForegroundColor Gray
        Write-Host "    Locked: $($user.isLocked)" -ForegroundColor Gray
        Write-Host "    Temporary Password: $($user.isTemporary)" -ForegroundColor Gray
        Write-Host "    Failed Attempts: $($user.failedAttempts)" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Host "❌ Failed to get account issues!" -ForegroundColor Red
}
Write-Host ""

# Step 3: Test unlock specific account (if any locked accounts exist)
if ($accountsResponse -and $accountsResponse.users) {
    $lockedUser = $accountsResponse.users | Where-Object { $_.isLocked -eq $true } | Select-Object -First 1
    
    if ($lockedUser) {
        Write-Host "3. Testing unlock specific account..." -ForegroundColor Yellow
        $unlockResponse = Invoke-WebRequestWithErrorHandling -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
            action = "unlock"
            userId = $lockedUser.userId
        } | ConvertTo-Json)
        
        if ($unlockResponse -and $unlockResponse.success) {
            Write-Host "✅ Account unlock successful: $($unlockResponse.message)" -ForegroundColor Green
        } else {
            Write-Host "❌ Account unlock failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "3. No locked accounts to test unlock with" -ForegroundColor Yellow
    }
} else {
    Write-Host "3. No account data to test unlock with" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Test reset password to NIC (if any users exist)
if ($accountsResponse -and $accountsResponse.users) {
    $userToReset = $accountsResponse.users | Where-Object { $_.user -ne $null } | Select-Object -First 1
    
    if ($userToReset) {
        Write-Host "4. Testing reset password to NIC..." -ForegroundColor Yellow
        
        # First get the user's NIC number
        $usersResponse = Invoke-WebRequestWithErrorHandling -Uri "$baseUrl/api/users" -Headers $headers
        $fullUser = $usersResponse.users | Where-Object { $_.id -eq $userToReset.userId }
        
        if ($fullUser -and $fullUser.nicNumber) {
            $resetResponse = Invoke-WebRequestWithErrorHandling -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
                action = "reset_password"
                userId = $userToReset.userId
                nicNumber = $fullUser.nicNumber
            } | ConvertTo-Json)
            
            if ($resetResponse -and $resetResponse.success) {
                Write-Host "✅ Password reset to NIC successful: $($resetResponse.message)" -ForegroundColor Green
            } else {
                Write-Host "❌ Password reset to NIC failed!" -ForegroundColor Red
                if ($resetResponse) {
                    Write-Host "Response: $($resetResponse | ConvertTo-Json)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "❌ Could not find user's NIC number for reset test" -ForegroundColor Red
        }
    } else {
        Write-Host "4. No users available to test password reset" -ForegroundColor Yellow
    }
} else {
    Write-Host "4. No account data to test password reset with" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Test unlock all accounts
Write-Host "5. Testing unlock all accounts..." -ForegroundColor Yellow
$unlockAllResponse = Invoke-WebRequestWithErrorHandling -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
    action = "unlock_all"
} | ConvertTo-Json)

if ($unlockAllResponse -and $unlockAllResponse.success) {
    Write-Host "✅ Unlock all accounts successful: $($unlockAllResponse.message)" -ForegroundColor Green
    Write-Host "Unlocked count: $($unlockAllResponse.unlockedCount)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Unlock all accounts failed!" -ForegroundColor Red
    if ($unlockAllResponse) {
        Write-Host "Response: $($unlockAllResponse | ConvertTo-Json)" -ForegroundColor Red
    }
}
Write-Host ""

# Step 6: Check account issues again after operations
Write-Host "6. Checking account issues after operations..." -ForegroundColor Yellow
$finalAccountsResponse = Invoke-WebRequestWithErrorHandling -Uri "$baseUrl/api/admin/accounts" -Headers $headers

if ($finalAccountsResponse) {
    Write-Host "✅ Final account check completed!" -ForegroundColor Green
    Write-Host "Total users with issues after operations: $($finalAccountsResponse.users.Count)" -ForegroundColor Cyan
    
    if ($finalAccountsResponse.users.Count -eq 0) {
        Write-Host "🎉 No account issues remaining!" -ForegroundColor Green
    } else {
        foreach ($user in $finalAccountsResponse.users) {
            Write-Host "  - User: $($user.userId)" -ForegroundColor White
            Write-Host "    Locked: $($user.isLocked)" -ForegroundColor Gray
            Write-Host "    Failed Attempts: $($user.failedAttempts)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Failed to get final account status!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ACCOUNT MANAGEMENT TEST COMPLETE ===" -ForegroundColor Cyan
