# WhatsApp Debugging Script
Write-Host "=== WHATSAPP DEBUGGING ANALYSIS ===" -ForegroundColor Green

# Test admin login first
Write-Host "1. Testing admin login..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@hambrianglory.lk"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $adminToken = $loginResponse.token
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
} catch {
    # Try NIC password
    $loginData2 = @{
        email = "admin@hambrianglory.lk"
        password = "198512345678"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData2 -ContentType "application/json"
        $adminToken = $loginResponse.token
        Write-Host "✅ Admin login successful with NIC!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cannot login as admin. Exiting..." -ForegroundColor Red
        exit 1
    }
}

$headers = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

# Get all users and analyze phone numbers
Write-Host "2. Analyzing user phone numbers..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/accounts" -Method GET -Headers $headers
    $allUsers = $usersResponse.users
    $activeMembers = $allUsers | Where-Object { $_.role -eq "member" -and $_.isActive -eq $true }
    
    Write-Host "📊 User Analysis:" -ForegroundColor Cyan
    Write-Host "  Total users: $($allUsers.Count)" -ForegroundColor White
    Write-Host "  Active members: $($activeMembers.Count)" -ForegroundColor White
    
    Write-Host "📱 Phone Numbers to receive messages:" -ForegroundColor Cyan
    foreach ($member in $activeMembers) {
        $phoneStatus = if ($member.phone -like "+94*") { "✅ Valid format" } else { "⚠️ May need formatting" }
        Write-Host "  $($member.name): $($member.phone) - $phoneStatus" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test WhatsApp announcement with detailed logging
Write-Host "3. Testing WhatsApp announcement..." -ForegroundColor Yellow
$whatsappData = @{
    title = "🧪 DEBUG TEST MESSAGE"
    content = "This is a debug test message to check WhatsApp integration. Phone: +94724222003 should receive this. Time: $(Get-Date)"
    userIds = $null  # Send to all active members
} | ConvertTo-Json

try {
    Write-Host "📤 Sending WhatsApp announcement..." -ForegroundColor Cyan
    $whatsappResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/announcement" -Method POST -Body $whatsappData -Headers $headers
    
    Write-Host "📊 WhatsApp Results:" -ForegroundColor Green
    Write-Host "  ✅ Total sent: $($whatsappResponse.result.totalSent)" -ForegroundColor Green
    Write-Host "  ❌ Total failed: $($whatsappResponse.result.totalFailed)" -ForegroundColor Red
    Write-Host "  👥 Total users: $($whatsappResponse.result.totalUsers)" -ForegroundColor Yellow
    
    if ($whatsappResponse.result.details) {
        Write-Host "📝 Detailed Results:" -ForegroundColor Cyan
        foreach ($detail in $whatsappResponse.result.details) {
            $status = if ($detail.success) { 
                "✅ SUCCESS" 
            } else { 
                "❌ FAILED: $($detail.error)" 
            }
            Write-Host "    📱 $($detail.phone): $status" -ForegroundColor White
        }
    }
    
    # Analysis
    Write-Host ""
    Write-Host "🔍 ANALYSIS:" -ForegroundColor Yellow
    if ($whatsappResponse.result.totalSent -eq 1 -and $whatsappResponse.result.totalUsers -gt 1) {
        Write-Host "⚠️  Only 1 message sent but $($whatsappResponse.result.totalUsers) users targeted" -ForegroundColor Yellow
        Write-Host "   This suggests phone number formatting or API configuration issues" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ WhatsApp test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚨 LIKELY ISSUES AND SOLUTIONS:" -ForegroundColor Red
Write-Host "1. Missing WhatsApp Phone Number ID" -ForegroundColor Yellow
Write-Host "   ➡️  You need to add WHATSAPP_PHONE_NUMBER_ID to .env.local" -ForegroundColor White
Write-Host "   ➡️  Get this from your Facebook Developer Console" -ForegroundColor White

Write-Host "2. WhatsApp Business API Setup" -ForegroundColor Yellow
Write-Host "   ➡️  Verify your WhatsApp Business account is approved" -ForegroundColor White
Write-Host "   ➡️  Check if phone numbers need to be verified recipients" -ForegroundColor White

Write-Host "3. Phone Number Format" -ForegroundColor Yellow
Write-Host "   ➡️  Ensure all numbers are in +94XXXXXXXXX format" -ForegroundColor White
Write-Host "   ➡️  Remove any spaces or special characters" -ForegroundColor White

Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Green
Write-Host "1. Get your WhatsApp Phone Number ID from Facebook Developer Console" -ForegroundColor White
Write-Host "2. Add it to .env.local as WHATSAPP_PHONE_NUMBER_ID=your_id_here" -ForegroundColor White
Write-Host "3. Restart the development server" -ForegroundColor White
Write-Host "4. Test again - should work for all numbers then" -ForegroundColor White
