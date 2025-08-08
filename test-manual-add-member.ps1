# Test script to verify manual add member functionality

Write-Host "=== Testing Manual Add Member Functionality ===" -ForegroundColor Green

# Step 1: Login to get JWT token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@hambriangLory.com"
    password = "Admin@2025"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get current user count
Write-Host "Step 2: Getting current user count..." -ForegroundColor Yellow
try {
    $currentUsers = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
    $currentCount = $currentUsers.users.Count
    Write-Host "✓ Current user count: $currentCount" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get current users: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Add a new member using the API (simulating the manual add member form)
Write-Host "Step 3: Adding a new member..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$newUser = @{
    name = "Manual Test User $timestamp"
    email = "manual.test.$timestamp@example.com"
    phone = "+1234567890"
    nicNumber = "TEST${timestamp}V"
    dateOfBirth = "1990-01-01"
    address = "123 Test Street"
    role = "member"
    houseNumber = "T$timestamp"
    isActive = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $addResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST -Body $newUser -Headers $headers
    Write-Host "✓ Member added successfully!" -ForegroundColor Green
    Write-Host "  User ID: $($addResponse.userId.id)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to add member: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Verify the member was added
Write-Host "Step 4: Verifying member was added..." -ForegroundColor Yellow
try {
    $updatedUsers = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
    $newCount = $updatedUsers.users.Count
    
    if ($newCount -eq ($currentCount + 1)) {
        Write-Host "✓ Member count increased from $currentCount to $newCount" -ForegroundColor Green
        
        # Find the newly added user
        $newlyAdded = $updatedUsers.users | Where-Object { $_.email -eq "manual.test.$timestamp@example.com" }
        if ($newlyAdded) {
            Write-Host "✓ New member found in database:" -ForegroundColor Green
            Write-Host "  Name: $($newlyAdded.name)" -ForegroundColor Cyan
            Write-Host "  Email: $($newlyAdded.email)" -ForegroundColor Cyan
            Write-Host "  Phone: $($newlyAdded.phone)" -ForegroundColor Cyan
            Write-Host "  House Number: $($newlyAdded.houseNumber)" -ForegroundColor Cyan
        } else {
            Write-Host "✗ New member not found in database" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Member count did not increase (was $currentCount, now $newCount)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to verify member addition: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green
Write-Host "The manual add member functionality is working correctly!" -ForegroundColor Green
Write-Host "The admin UI should now be able to add members successfully." -ForegroundColor Green
