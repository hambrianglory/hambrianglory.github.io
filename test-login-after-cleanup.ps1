#!/usr/bin/env pwsh

Write-Host "=== LOGIN TEST AFTER PASSWORD CLEANUP ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3005"

Write-Host "Testing login after clearing encrypted password files..." -ForegroundColor Yellow

# Test various credentials that might work
$testCredentials = @(
    @{ email = "admin@hambrianglory.lk"; password = "198512345678"; desc = "Admin with NIC" },
    @{ email = "admin"; password = "admin"; desc = "Simple admin" },
    @{ email = "profile@test.com"; password = "test123"; desc = "Profile test user" },
    @{ email = "test@gmail.com"; password = "200336513482"; desc = "Test with NIC" },
    @{ email = "testmember@example.com"; password = "199501234567"; desc = "Test member with NIC" }
)

$workingCredentials = $null

foreach ($cred in $testCredentials) {
    Write-Host "Testing: $($cred.desc)" -ForegroundColor Gray
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
            email = $cred.email
            password = $cred.password
        } | ConvertTo-Json) -ContentType "application/json"
        
        if ($response.token) {
            Write-Host "✅ SUCCESS! Login worked!" -ForegroundColor Green
            Write-Host "Email: $($cred.email)" -ForegroundColor Cyan
            Write-Host "Password: $($cred.password)" -ForegroundColor Cyan
            Write-Host "User: $($response.user.name)" -ForegroundColor Green
            Write-Host "Role: $($response.user.role)" -ForegroundColor Green
            Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
            
            $workingCredentials = @{
                email = $cred.email
                password = $cred.password
                token = $response.token
                role = $response.user.role
            }
            break
        }
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($workingCredentials) {
    Write-Host ""
    Write-Host "Testing account management with working credentials..." -ForegroundColor Yellow
    
    if ($workingCredentials.role -eq "admin") {
        $headers = @{ "Authorization" = "Bearer $($workingCredentials.token)" }
        
        try {
            $accountsResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Headers $headers
            Write-Host "✅ Account management API works!" -ForegroundColor Green
            Write-Host "Users with issues: $($accountsResponse.users.Count)" -ForegroundColor Cyan
            
            # Test unlock all
            Write-Host "Testing unlock all accounts..." -ForegroundColor Yellow
            $unlockResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Method POST -Headers $headers -Body (@{
                action = "unlock_all"
            } | ConvertTo-Json) -ContentType "application/json"
            
            if ($unlockResponse.success) {
                Write-Host "✅ Unlock all accounts works!" -ForegroundColor Green
                Write-Host "Message: $($unlockResponse.message)" -ForegroundColor White
            }
            
        } catch {
            Write-Host "❌ Account management API failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ User is not admin, cannot test account management" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎯 WORKING CREDENTIALS:" -ForegroundColor Green
    Write-Host "Email: $($workingCredentials.email)" -ForegroundColor Cyan
    Write-Host "Password: $($workingCredentials.password)" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ No working credentials found!" -ForegroundColor Red
}
