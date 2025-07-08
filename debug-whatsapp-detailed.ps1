# WhatsApp Detailed Debugging Script
Write-Host "=== WHATSAPP DETAILED DEBUGGING ===" -ForegroundColor Green

# Test admin login
Write-Host "1. Testing admin login..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@hambrianglory.lk"
    password = "admin123"
} | ConvertTo-Json

$adminToken = $null
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $adminToken = $loginResponse.token
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
} catch {
    # Try with NIC password
    $loginData2 = @{
        email = "admin@hambrianglory.lk"
        password = "198512345678"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method POST -Body $loginData2 -ContentType "application/json"
        $adminToken = $loginResponse.token
        Write-Host "✅ Admin login successful with NIC!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cannot login. Trying to create admin user..." -ForegroundColor Red
        
        # Try to create admin user
        try {
            $createAdminData = @{
                name = "Community Admin"
                email = "admin@hambrianglory.lk"
                phone = "+94112345678"
                nicNumber = "198512345678"
                dateOfBirth = "1985-06-15"
                address = "Hambrian Glory Community Office"
                role = "admin"
                password = "admin123"
            } | ConvertTo-Json
            
            $createResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/register" -Method POST -Body $createAdminData -ContentType "application/json"
            Write-Host "✅ Admin user created, trying login again..." -ForegroundColor Green
            
            $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
            $adminToken = $loginResponse.token
            Write-Host "✅ Login successful after creation!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Cannot create or login as admin. Skipping authenticated tests..." -ForegroundColor Red
        }
    }
}

if ($adminToken) {
    $headers = @{
        'Authorization' = "Bearer $adminToken"
        'Content-Type' = 'application/json'
    }

    # Get users
    Write-Host "2. Getting user data..." -ForegroundColor Yellow
    try {
        $usersResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/admin/accounts" -Method GET -Headers $headers
        $allUsers = $usersResponse.users
        $activeMembers = $allUsers | Where-Object { $_.role -eq "member" -and $_.isActive -eq $true }
        
        Write-Host "📊 Users found:" -ForegroundColor Cyan
        Write-Host "  Total users: $($allUsers.Count)" -ForegroundColor White
        Write-Host "  Active members: $($activeMembers.Count)" -ForegroundColor White
        
        foreach ($member in $activeMembers) {
            Write-Host "  👤 $($member.name): $($member.phone)" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test WhatsApp announcement with detailed error handling
    Write-Host "3. Testing WhatsApp announcement..." -ForegroundColor Yellow
    $whatsappData = @{
        title = "🧪 DETAILED DEBUG TEST"
        content = "This is a detailed debug test. Each member should receive this message. Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        userIds = $null
    } | ConvertTo-Json

    try {
        Write-Host "📤 Sending WhatsApp request..." -ForegroundColor Cyan
        $whatsappResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/whatsapp/announcement" -Method POST -Body $whatsappData -Headers $headers
        
        Write-Host "📊 WhatsApp API Response:" -ForegroundColor Green
        Write-Host "  ✅ Total sent: $($whatsappResponse.result.totalSent)" -ForegroundColor Green
        Write-Host "  ❌ Total failed: $($whatsappResponse.result.totalFailed)" -ForegroundColor Red
        Write-Host "  👥 Total users: $($whatsappResponse.result.totalUsers)" -ForegroundColor Yellow
        
        if ($whatsappResponse.result.details) {
            Write-Host "📝 Individual Results:" -ForegroundColor Cyan
            foreach ($detail in $whatsappResponse.result.details) {
                $status = if ($detail.success) { 
                    "✅ SUCCESS" 
                } else { 
                    "❌ FAILED: $($detail.error)" 
                }
                Write-Host "    📱 User: $($detail.userId), Phone: $($detail.phone) → $status" -ForegroundColor White
            }
        } else {
            Write-Host "⚠️  No detailed results returned" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ WhatsApp API call failed!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd()
                Write-Host "Response body: $errorContent" -ForegroundColor Red
            } catch {
                Write-Host "Could not read error response body" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "⚠️  Skipping authenticated tests due to login failure" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4. Checking server logs for more details..." -ForegroundColor Yellow
Write-Host "Check the terminal where 'npm run dev' is running for detailed logs" -ForegroundColor White
Write-Host "Look for messages starting with:" -ForegroundColor White
Write-Host "  🚀 Attempting to send WhatsApp..." -ForegroundColor Cyan
Write-Host "  📊 WhatsApp API Response Status..." -ForegroundColor Cyan
Write-Host "  ✅ WhatsApp API Success..." -ForegroundColor Green
Write-Host "  ❌ WhatsApp API Error..." -ForegroundColor Red

Write-Host ""
Write-Host "🔍 POSSIBLE ISSUES TO CHECK:" -ForegroundColor Yellow
Write-Host "1. WhatsApp Business Account Status:" -ForegroundColor White
Write-Host "   • Is your WhatsApp Business account approved for sending?" -ForegroundColor Gray
Write-Host "   • Are you in sandbox mode (limited to verified numbers)?" -ForegroundColor Gray

Write-Host "2. Phone Number Verification:" -ForegroundColor White
Write-Host "   • In sandbox mode, you may need to verify recipient numbers" -ForegroundColor Gray
Write-Host "   • Check Facebook Developer Console > WhatsApp > Phone Numbers" -ForegroundColor Gray

Write-Host "3. Rate Limiting:" -ForegroundColor White
Write-Host "   • WhatsApp API has rate limits" -ForegroundColor Gray
Write-Host "   • Check if you're hitting message limits" -ForegroundColor Gray

Write-Host "4. Template Message Requirements:" -ForegroundColor White
Write-Host "   • Some regions require approved message templates" -ForegroundColor Gray
Write-Host "   • Try using approved templates instead of free-form text" -ForegroundColor Gray
