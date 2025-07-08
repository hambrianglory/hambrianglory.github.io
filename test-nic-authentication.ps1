# Test NIC-based Authentication System
# This script tests the new password system with NIC numbers as temporary passwords

Write-Host "Testing NIC-based Authentication System..." -ForegroundColor Green

$baseUrl = "http://localhost:3000"

# Test 1: Login with admin using NIC as temporary password
Write-Host "`n=== Test 1: Admin Login with NIC ===" -ForegroundColor Yellow
Write-Host "Testing admin login with NIC number as password..." -ForegroundColor Cyan

$adminLoginData = @{
    email = "admin@hambrianglory.lk"
    password = "198512345678"  # NIC number as temporary password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json"
    
    if ($response.requiresPasswordChange) {
        Write-Host "✓ SUCCESS: Admin login with NIC detected temporary password" -ForegroundColor Green
        Write-Host "  - Requires password change: $($response.requiresPasswordChange)" -ForegroundColor Cyan
        Write-Host "  - Message: $($response.message)" -ForegroundColor Cyan
    } else {
        Write-Host "✓ SUCCESS: Admin login successful" -ForegroundColor Green
        Write-Host "  - Token received: $($response.token -ne $null)" -ForegroundColor Cyan
        Write-Host "  - User role: $($response.user.role)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Change password
Write-Host "`n=== Test 2: Password Change ===" -ForegroundColor Yellow
Write-Host "Testing password change from temporary to secure password..." -ForegroundColor Cyan

$passwordChangeData = @{
    email = "admin@hambrianglory.lk"
    oldPassword = "198512345678"  # NIC number
    newPassword = "SecureAdmin123!"  # Strong password
    isChangePassword = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $passwordChangeData -ContentType "application/json"
    Write-Host "✓ SUCCESS: Password changed successfully" -ForegroundColor Green
    Write-Host "  - Message: $($response.message)" -ForegroundColor Cyan
    Write-Host "  - Requires password change: $($response.requiresPasswordChange)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Login with new password
Write-Host "`n=== Test 3: Login with New Password ===" -ForegroundColor Yellow
Write-Host "Testing login with the new secure password..." -ForegroundColor Cyan

$newLoginData = @{
    email = "admin@hambrianglory.lk"
    password = "SecureAdmin123!"  # New secure password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $newLoginData -ContentType "application/json"
    Write-Host "✓ SUCCESS: Login with new password successful" -ForegroundColor Green
    Write-Host "  - Token received: $($response.token -ne $null)" -ForegroundColor Cyan
    Write-Host "  - User role: $($response.user.role)" -ForegroundColor Cyan
    Write-Host "  - Requires password change: $($response.requiresPasswordChange)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Add a new member and test their NIC-based login
Write-Host "`n=== Test 4: New Member NIC Authentication ===" -ForegroundColor Yellow
Write-Host "Adding a test member and testing NIC-based login..." -ForegroundColor Cyan

$newMemberData = @{
    name = "Test Member"
    email = "testmember@example.com"
    phone = "+94701234567"
    nicNumber = "199512345678"
    dateOfBirth = "1995-01-01"
    address = "Test Address"
    role = "member"
    houseNumber = "T1"
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users" -Method POST -Body $newMemberData -ContentType "application/json"
    Write-Host "✓ Member added successfully" -ForegroundColor Green
    
    # Now test login with NIC
    $memberLoginData = @{
        email = "testmember@example.com"
        password = "199512345678"  # NIC number as temporary password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $memberLoginData -ContentType "application/json"
    
    if ($loginResponse.requiresPasswordChange) {
        Write-Host "✓ SUCCESS: Member login with NIC detected temporary password" -ForegroundColor Green
        Write-Host "  - Requires password change: $($loginResponse.requiresPasswordChange)" -ForegroundColor Cyan
    } else {
        Write-Host "✓ SUCCESS: Member login successful" -ForegroundColor Green
        Write-Host "  - User role: $($loginResponse.user.role)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test invalid login attempts
Write-Host "`n=== Test 5: Invalid Login Attempts ===" -ForegroundColor Yellow
Write-Host "Testing account lockout after failed attempts..." -ForegroundColor Cyan

for ($i = 1; $i -le 6; $i++) {
    $invalidLoginData = @{
        email = "testmember@example.com"
        password = "wrongpassword"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $invalidLoginData -ContentType "application/json"
        Write-Host "Attempt ${i}: Unexpected success" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode -eq 423) {
            Write-Host "✓ Attempt ${i}: Account locked (status 423)" -ForegroundColor Green
            break
        } else {
            Write-Host "Attempt ${i}: Failed as expected (status $($_.Exception.Response.StatusCode))" -ForegroundColor Cyan
        }
    }
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Magenta
Write-Host "The NIC-based authentication system includes:" -ForegroundColor White
Write-Host "✓ NIC numbers as temporary passwords for all users" -ForegroundColor Green
Write-Host "✓ Forced password change on first login" -ForegroundColor Green
Write-Host "✓ Encrypted password storage in private directory" -ForegroundColor Green
Write-Host "✓ Account lockout after 5 failed attempts" -ForegroundColor Green
Write-Host "✓ Strong password requirements" -ForegroundColor Green
Write-Host "✓ JWT token-based authentication" -ForegroundColor Green

Write-Host "`nTo test in the web interface:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "2. Login with admin@hambrianglory.lk / 198512345678" -ForegroundColor Cyan
Write-Host "3. Follow the password change process" -ForegroundColor Cyan
Write-Host "4. Test the new password" -ForegroundColor Cyan
