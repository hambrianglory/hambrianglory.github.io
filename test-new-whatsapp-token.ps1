# Test WhatsApp with New Access Token
# This script tests the updated WhatsApp access token

Write-Host "=== Testing WhatsApp with New Access Token ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Get the new token from .env.local
$envFile = ".env.local"
$envContent = Get-Content $envFile
$token = ($envContent | Where-Object { $_ -like "WHATSAPP_ACCESS_TOKEN=*" }) -replace "WHATSAPP_ACCESS_TOKEN=", ""
$phoneId = ($envContent | Where-Object { $_ -like "WHATSAPP_PHONE_NUMBER_ID=*" }) -replace "WHATSAPP_PHONE_NUMBER_ID=", ""

Write-Host "Using new token: $($token.Substring(0,30))..." -ForegroundColor Cyan
Write-Host "Phone ID: $phoneId" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verify token works
Write-Host "1. Testing Token Validity..." -ForegroundColor Yellow
try {
    $tokenUrl = "https://graph.facebook.com/v23.0/me?fields=id,name&access_token=$token"
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET
    Write-Host "✓ Token is valid!" -ForegroundColor Green
    Write-Host "- Account ID: $($tokenResponse.id)" -ForegroundColor Cyan
    Write-Host "- Account Name: $($tokenResponse.name)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Token validation failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Check phone number access
Write-Host "2. Testing Phone Number Access..." -ForegroundColor Yellow
try {
    $phoneUrl = "https://graph.facebook.com/v23.0/$phoneId" + "?access_token=$token"
    $phoneResponse = Invoke-RestMethod -Uri $phoneUrl -Method GET
    Write-Host "✓ Phone number accessible!" -ForegroundColor Green
    Write-Host "- Display Number: $($phoneResponse.display_phone_number)" -ForegroundColor Cyan
    Write-Host "- Verified Name: $($phoneResponse.verified_name)" -ForegroundColor Cyan
    Write-Host "- Quality Rating: $($phoneResponse.quality_rating)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Phone number access failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Send a test message
Write-Host "3. Testing Message Sending..." -ForegroundColor Yellow
Write-Host "Enter phone number to test (format: +94xxxxxxxxx): " -NoNewline
$testPhone = Read-Host

if ($testPhone) {
    try {
        $messageUrl = "https://graph.facebook.com/v23.0/$phoneId/messages"
        $messageBody = @{
            messaging_product = "whatsapp"
            to = $testPhone
            type = "text"
            text = @{
                body = "🎉 New WhatsApp token test successful! 

Hello from Hambrian Glory Community!

✅ Updated access token is working
⏰ Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
📱 Sent to: $testPhone

If you receive this message, the WhatsApp integration is now fully functional!"
            }
        } | ConvertTo-Json -Depth 3

        $headers = @{
            'Authorization' = "Bearer $token"
            'Content-Type' = 'application/json'
        }

        Write-Host "Sending test message..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $messageBody -Headers $headers
        
        Write-Host "✓ Message sent successfully!" -ForegroundColor Green
        Write-Host "- Message ID: $($response.messages[0].id)" -ForegroundColor Cyan
        Write-Host "- Contact WhatsApp ID: $($response.contacts[0].wa_id)" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "🎯 IMPORTANT: Please check if you received the WhatsApp message!" -ForegroundColor Yellow
        Write-Host "   If received → WhatsApp integration is working perfectly!" -ForegroundColor Green
        Write-Host "   If not received → Account still has sandbox restrictions" -ForegroundColor Red
        
    } catch {
        Write-Host "✗ Message sending failed!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "API Error Response: $errorBody" -ForegroundColor Red
            } catch {
                Write-Host "Could not read error details" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""

# Test 4: Test with community members
Write-Host "4. Testing with Community Members..." -ForegroundColor Yellow
$usersFile = "private/data/users.json"
if (Test-Path $usersFile) {
    $users = Get-Content $usersFile | ConvertFrom-Json
    Write-Host "✓ Found $($users.Count) community members" -ForegroundColor Green
    
    Write-Host "Would you like to send a test message to all community members? (y/n): " -NoNewline
    $sendAll = Read-Host
    
    if ($sendAll -eq "y" -or $sendAll -eq "yes") {
        Write-Host ""
        Write-Host "Sending test messages to all community members..." -ForegroundColor Cyan
        
        foreach ($user in $users) {
            try {
                $communityMessage = @{
                    messaging_product = "whatsapp"
                    to = $user.phone
                    type = "text"
                    text = @{
                        body = "🔔 Hambrian Glory Community Update

Hello $($user.name)!

✅ WhatsApp integration has been updated and is now working!

🎯 You will now receive:
- Payment reminders
- Community announcements  
- Important updates

⏰ Sent: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Thank you for being part of our community!

- Management Team"
                    }
                } | ConvertTo-Json -Depth 3
                
                $response = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $communityMessage -Headers $headers
                Write-Host "✓ Message sent to $($user.name) ($($user.phone))" -ForegroundColor Green
                Write-Host "  Message ID: $($response.messages[0].id)" -ForegroundColor Gray
                
                # Small delay to avoid rate limiting
                Start-Sleep -Seconds 1
                
            } catch {
                Write-Host "✗ Failed to send to $($user.name) ($($user.phone))" -ForegroundColor Red
                Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "📢 Community messages sent! Please ask members to confirm receipt." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 WhatsApp testing complete with new access token!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Confirm message delivery with recipients" -ForegroundColor White
Write-Host "2. If messages are received → Integration is working!" -ForegroundColor White
Write-Host "3. If not received → Check Facebook Developer Console for sandbox restrictions" -ForegroundColor White
