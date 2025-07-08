# Test Member Role Persistence
# This script tests if member role changes persist after page refresh

Write-Host "Testing Member Role Persistence..." -ForegroundColor Green

# Test 1: Add a test member
Write-Host "`n1. Testing member addition..." -ForegroundColor Yellow
$addMemberData = @{
    name = "Test Member Role Change"
    email = "test.rolechange@example.com"
    phone = "+94701234567"
    nicNumber = "199012345678"
    dateOfBirth = "1990-01-01"
    address = "Test Address"
    role = "member"
    houseNumber = "T1"
    isActive = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST -Body $addMemberData -ContentType "application/json"
    Write-Host "✓ Member added successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to add member: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get all users to find the test member
Write-Host "`n2. Fetching users to find test member..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
    $testMember = $users.users | Where-Object { $_.email -eq "test.rolechange@example.com" }
    
    if ($testMember) {
        Write-Host "✓ Test member found with ID: $($testMember.id)" -ForegroundColor Green
        Write-Host "  Current role: $($testMember.role)" -ForegroundColor Cyan
        
        # Test 3: Update member role from member to admin
        Write-Host "`n3. Updating member role to admin..." -ForegroundColor Yellow
        $updateData = @{
            id = $testMember.id
            role = "admin"
        } | ConvertTo-Json
        
        try {
            $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method PUT -Body $updateData -ContentType "application/json"
            Write-Host "✓ Member role updated successfully" -ForegroundColor Green
            
            # Test 4: Verify the change persisted
            Write-Host "`n4. Verifying role change persisted..." -ForegroundColor Yellow
            $usersAfterUpdate = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
            $updatedMember = $usersAfterUpdate.users | Where-Object { $_.id -eq $testMember.id }
            
            if ($updatedMember -and $updatedMember.role -eq "admin") {
                Write-Host "✓ SUCCESS: Role change persisted! Member is now: $($updatedMember.role)" -ForegroundColor Green
            } else {
                Write-Host "✗ FAILED: Role change did not persist. Current role: $($updatedMember.role)" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "✗ Failed to update member role: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Cleanup: Delete test member
        Write-Host "`n5. Cleaning up test member..." -ForegroundColor Yellow
        try {
            Invoke-RestMethod -Uri "http://localhost:3000/api/users?id=$($testMember.id)" -Method DELETE
            Write-Host "✓ Test member deleted successfully" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to delete test member: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "✗ Test member not found" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to fetch users: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Magenta
Write-Host "This test verifies that member role changes are now persistent." -ForegroundColor White
Write-Host "If successful, role changes should survive page refreshes." -ForegroundColor White
Write-Host "`nNow test in the admin panel:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "2. Edit a member's role from 'member' to 'admin'" -ForegroundColor Cyan
Write-Host "3. Save the changes" -ForegroundColor Cyan
Write-Host "4. Refresh the page" -ForegroundColor Cyan
Write-Host "5. Verify the role change persisted" -ForegroundColor Cyan
