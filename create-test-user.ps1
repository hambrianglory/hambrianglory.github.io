#!/usr/bin/env pwsh

# Create test user for profile picture demonstration
Write-Host "🧪 Creating test user for profile picture demo..." -ForegroundColor Cyan

$testUser = @{
    id = "test_user_demo"
    name = "Profile Test User"
    email = "profile@test.com"
    phone = "+94771234567"
    nicNumber = "199512345678"
    dateOfBirth = "1995-01-01T00:00:00.000Z"
    address = "Test Address, Colombo"
    role = "member"
    membershipDate = "2024-01-01T00:00:00.000Z"
    isActive = $true
}

# Create the test user
$usersFile = "private\data\users.json"
$users = @()

if (Test-Path $usersFile) {
    $users = Get-Content $usersFile | ConvertFrom-Json
}

# Remove existing test user if exists
$users = $users | Where-Object { $_.id -ne "test_user_demo" }

# Add the new test user
$users += $testUser

# Save users
$users | ConvertTo-Json -Depth 10 | Set-Content $usersFile

Write-Host "✅ Test user created with credentials:" -ForegroundColor Green
Write-Host "   Email: profile@test.com" -ForegroundColor Yellow  
Write-Host "   Password: test123" -ForegroundColor Yellow

Write-Host "🎯 You can now:" -ForegroundColor White
Write-Host "1. Login with these credentials"
Write-Host "2. Test the profile picture upload feature"
Write-Host "3. View profile pictures in the dashboard"
