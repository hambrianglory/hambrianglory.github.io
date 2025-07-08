#!/usr/bin/env pwsh

Write-Host "=== CREATING TEST USERS WITH ACCOUNT ISSUES ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3005"

# Login as admin first
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$adminResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
    email = "admin@hambrianglory.lk"
    password = "198512345678"
} | ConvertTo-Json) -ContentType "application/json"

$adminToken = $adminResponse.token
$headers = @{ "Authorization" = "Bearer $adminToken" }

Write-Host "2. Creating test users with account issues..." -ForegroundColor Yellow

# Test user credentials to create failed login attempts
$testUsers = @(
    @{ email = "test@gmail.com"; wrongPassword = "wrongpass123"; correctPassword = "200336513482" },
    @{ email = "testmember@example.com"; wrongPassword = "badpass456"; correctPassword = "199501234567" },
    @{ email = "profile@test.com"; wrongPassword = "incorrect789"; correctPassword = "test123" }
)

foreach ($user in $testUsers) {
    Write-Host "Creating failed login attempts for: $($user.email)" -ForegroundColor Gray
    
    # Create several failed login attempts to trigger lockout
    for ($i = 1; $i -le 6; $i++) {
        try {
            Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
                email = $user.email
                password = $user.wrongPassword
            } | ConvertTo-Json) -ContentType "application/json"
        } catch {
            Write-Host "  Failed attempt $i (expected)" -ForegroundColor DarkGray
        }
    }
    
    Write-Host "✅ Created failed attempts for $($user.email)" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Checking account issues after creating test data..." -ForegroundColor Yellow

$accountsResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/accounts" -Headers $headers
Write-Host "✅ Users with issues: $($accountsResponse.users.Count)" -ForegroundColor Green

foreach ($user in $accountsResponse.users) {
    Write-Host "  - User: $($user.userId)" -ForegroundColor White
    Write-Host "    Name: $($user.user.name)" -ForegroundColor Gray
    Write-Host "    Email: $($user.user.email)" -ForegroundColor Gray
    Write-Host "    Locked: $($user.isLocked)" -ForegroundColor Gray
    Write-Host "    Temporary: $($user.isTemporary)" -ForegroundColor Gray
    Write-Host "    Failed Attempts: $($user.failedAttempts)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🎯 Now you can test the search functionality in the admin panel!" -ForegroundColor Cyan
Write-Host "Visit: http://localhost:3005/admin" -ForegroundColor White
Write-Host "Go to Account Management tab and try searching for:" -ForegroundColor White
Write-Host "  - User names (Community, Test)" -ForegroundColor Gray
Write-Host "  - Emails (admin@, test@, testmember@)" -ForegroundColor Gray
Write-Host "  - User IDs (admin_1, user_)" -ForegroundColor Gray
