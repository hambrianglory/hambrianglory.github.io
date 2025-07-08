#!/usr/bin/env pwsh

Write-Host "=== ACCOUNT MANAGEMENT API TEST (Manual Token) ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3005"

# First, let's test the accounts API with a proper token
# We'll login manually through the UI first to get a token
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3005/login in your browser" -ForegroundColor White
Write-Host "2. Try these credentials:" -ForegroundColor White
Write-Host "   - admin / admin" -ForegroundColor Green
Write-Host "   - admin@hambrianglory.lk / 198512345678" -ForegroundColor Green  
Write-Host "   - profile@test.com / test123" -ForegroundColor Green
Write-Host "3. After successful login, open developer tools" -ForegroundColor White
Write-Host "4. Check localStorage for 'token' key" -ForegroundColor White
Write-Host "5. Copy the token value and paste it when prompted" -ForegroundColor White
Write-Host ""

$token = Read-Host "Enter the JWT token from localStorage (or press Enter to skip)"

if (-not $token.Trim()) {
    Write-Host "⚠️ No token provided. Testing account management API without authentication..." -ForegroundColor Yellow
    
    # Test without token to see if we get proper error
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts"
        Write-Host "❌ Unexpected: API allowed access without token!" -ForegroundColor Red
    } catch {
        Write-Host "✅ Proper authentication required (as expected)" -ForegroundColor Green
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    exit
}

Write-Host "Testing with provided token..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }

# Test 1: Get account issues
Write-Host "1. Testing GET /api/admin/accounts..." -ForegroundColor Cyan
try {
    $accountsResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Headers $headers
    Write-Host "✅ GET accounts successful!" -ForegroundColor Green
    Write-Host "Users with issues: $($accountsResponse.users.Count)" -ForegroundColor White
    
    foreach ($user in $accountsResponse.users) {
        Write-Host "  - User: $($user.userId)" -ForegroundColor Gray
        Write-Host "    Name: $($user.user.name)" -ForegroundColor Gray
        Write-Host "    Locked: $($user.isLocked)" -ForegroundColor Gray
        Write-Host "    Temporary: $($user.isTemporary)" -ForegroundColor Gray
        Write-Host "    Failed Attempts: $($user.failedAttempts)" -ForegroundColor Gray
    }
    
    # Test 2: Unlock all accounts
    Write-Host ""
    Write-Host "2. Testing unlock all accounts..." -ForegroundColor Cyan
    $unlockAllResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
        action = "unlock_all"
    } | ConvertTo-Json) -ContentType "application/json"
    
    if ($unlockAllResponse.success) {
        Write-Host "✅ Unlock all successful!" -ForegroundColor Green
        Write-Host "Unlocked count: $($unlockAllResponse.unlockedCount)" -ForegroundColor White
        Write-Host "Message: $($unlockAllResponse.message)" -ForegroundColor White
    } else {
        Write-Host "❌ Unlock all failed!" -ForegroundColor Red
    }
    
    # Test 3: Reset password to NIC (if users exist)
    if ($accountsResponse.users.Count -gt 0) {
        $testUser = $accountsResponse.users[0]
        if ($testUser.user) {
            Write-Host ""
            Write-Host "3. Testing reset password to NIC..." -ForegroundColor Cyan
            
            # Get user's NIC from users API
            $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/users" -Headers $headers
            $fullUser = $usersResponse.users | Where-Object { $_.id -eq $testUser.userId }
            
            if ($fullUser.nicNumber) {
                $resetResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
                    action = "reset_password"
                    userId = $testUser.userId
                    nicNumber = $fullUser.nicNumber
                } | ConvertTo-Json) -ContentType "application/json"
                
                if ($resetResponse.success) {
                    Write-Host "✅ Password reset successful!" -ForegroundColor Green
                    Write-Host "Message: $($resetResponse.message)" -ForegroundColor White
                } else {
                    Write-Host "❌ Password reset failed!" -ForegroundColor Red
                }
            } else {
                Write-Host "⚠️ No NIC number found for user" -ForegroundColor Yellow
            }
        }
    }
    
} catch {
    Write-Host "❌ API test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
