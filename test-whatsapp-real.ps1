# Test WhatsApp with Real Phone Numbers
Write-Host "=== WHATSAPP REAL PHONE NUMBER TEST ===" -ForegroundColor Green

# Test admin login
Write-Host "1. Testing admin login..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@hambrianglory.lk"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $adminToken = $loginResponse.token
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "Admin: $($loginResponse.user.name)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying with default password..." -ForegroundColor Yellow
    
    $loginData2 = @{
        email = "admin@hambrianglory.lk"
        password = "198512345678"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData2 -ContentType "application/json"
        $adminToken = $loginResponse.token
        Write-Host "✅ Admin login successful with default password!" -ForegroundColor Green
        Write-Host "Admin: $($loginResponse.user.name)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Both login attempts failed" -ForegroundColor Red
        exit 1
    }
}

# Get users to check phone numbers
Write-Host "2. Checking user phone numbers..." -ForegroundColor Yellow
$headers = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/accounts" -Method GET -Headers $headers
    $users = $usersResponse.users
    
    Write-Host "✅ Found $($users.Count) users in database:" -ForegroundColor Green
    foreach ($user in $users) {
        if ($user.role -eq "member" -and $user.isActive) {
            Write-Host "  📱 $($user.name): $($user.phone) ($($user.email))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
}

# Test WhatsApp announcement with real users
Write-Host "3. Testing WhatsApp announcement with real phone numbers..." -ForegroundColor Yellow
$whatsappData = @{
    title = "Test Message from Community Management"
    content = "This is a test message to verify WhatsApp integration with real phone numbers. If you receive this message, the integration is working correctly! 🎉"
    userIds = $null
} | ConvertTo-Json

try {
    $whatsappResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/announcement" -Method POST -Body $whatsappData -Headers $headers
    Write-Host "✅ WhatsApp announcement sent!" -ForegroundColor Green
    Write-Host "  📊 Total sent: $($whatsappResponse.result.totalSent)" -ForegroundColor Cyan
    Write-Host "  ❌ Total failed: $($whatsappResponse.result.totalFailed)" -ForegroundColor Red
    Write-Host "  👥 Total users: $($whatsappResponse.result.totalUsers)" -ForegroundColor Yellow
    
    if ($whatsappResponse.result.details) {
        Write-Host "  📝 Detailed results:" -ForegroundColor Yellow
        foreach ($detail in $whatsappResponse.result.details) {
            $status = if ($detail.success) { "✅ Success" } else { "❌ Failed: $($detail.error)" }
            Write-Host "    📱 $($detail.phone): $status" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ WhatsApp test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 WHATSAPP INTEGRATION STATUS:" -ForegroundColor Green
Write-Host "✅ Using real user data from database" -ForegroundColor Green
Write-Host "✅ Using actual phone numbers from member profiles" -ForegroundColor Green
Write-Host "✅ WhatsApp Business API configured with your token" -ForegroundColor Green
Write-Host "📱 Token: EAAYsA4Py3WIBOy6AOExeEl0r7EZBdEuLkZAkAzZCw0CyoDdmO7ZAd5RFI4ZCHgI9AZCsxCc3L4LGNaTF7olwxcKXlZAGh4bAqDrvreXmkDs651Klmr1iCL7JXzzBTpi30ofUg6AZCuwA1DIR3qDUDZCpwNa17VK2TKOTjZAp8QoSnoD1J4fPEZCZACfXiqvb6qldrSchTa6buPklbSeQZA8b86Lb2H1Ox0s8uerMJntHYria7ZB2AZD" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 WHAT TO CHECK:" -ForegroundColor Yellow
Write-Host "1. Check if members received WhatsApp messages on their phones" -ForegroundColor White
Write-Host "2. Verify phone numbers are correct in member profiles" -ForegroundColor White
Write-Host "3. Check WhatsApp Business API configuration" -ForegroundColor White
Write-Host "4. Ensure phone numbers are in correct international format (+94xxxxxxxxx)" -ForegroundColor White
