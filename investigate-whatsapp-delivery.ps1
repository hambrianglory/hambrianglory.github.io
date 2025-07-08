# WhatsApp Business API Delivery Investigation Script
# This script helps diagnose why messages show as sent but aren't received

Write-Host "=== WhatsApp Business API Delivery Investigation ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Check environment variables
Write-Host "1. Checking Environment Variables..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    Write-Host "✓ .env.local file exists" -ForegroundColor Green
    
    $token = ($envContent | Where-Object { $_ -like "WHATSAPP_ACCESS_TOKEN=*" }) -replace "WHATSAPP_ACCESS_TOKEN=", ""
    $phoneId = ($envContent | Where-Object { $_ -like "WHATSAPP_PHONE_NUMBER_ID=*" }) -replace "WHATSAPP_PHONE_NUMBER_ID=", ""
    $businessId = ($envContent | Where-Object { $_ -like "WHATSAPP_BUSINESS_ACCOUNT_ID=*" }) -replace "WHATSAPP_BUSINESS_ACCOUNT_ID=", ""
    
    Write-Host "- Access Token: $($token.Substring(0,20))..." -ForegroundColor Cyan
    Write-Host "- Phone Number ID: $phoneId" -ForegroundColor Cyan
    Write-Host "- Business Account ID: $businessId" -ForegroundColor Cyan
} else {
    Write-Host "✗ .env.local file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 1: Verify token is valid
Write-Host "2. Testing Access Token Validity..." -ForegroundColor Yellow
try {
    $tokenTestUrl = "https://graph.facebook.com/v21.0/me?access_token=$token"
    $tokenResponse = Invoke-RestMethod -Uri $tokenTestUrl -Method GET
    Write-Host "✓ Access token is valid" -ForegroundColor Green
    Write-Host "- Token belongs to: $($tokenResponse.name)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Access token invalid or expired!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Check phone number details
Write-Host "3. Checking Phone Number Details..." -ForegroundColor Yellow
try {
    $phoneUrl = "https://graph.facebook.com/v21.0/$phoneId" + "?access_token=$token"
    $phoneResponse = Invoke-RestMethod -Uri $phoneUrl -Method GET
    Write-Host "✓ Phone number accessible" -ForegroundColor Green
    Write-Host "- Display Name: $($phoneResponse.display_phone_number)" -ForegroundColor Cyan
    Write-Host "- Verified Name: $($phoneResponse.verified_name)" -ForegroundColor Cyan
    Write-Host "- Quality Rating: $($phoneResponse.quality_rating)" -ForegroundColor Cyan
    Write-Host "- Status: $($phoneResponse.status)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Cannot access phone number details!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check business account status
Write-Host "4. Checking Business Account Status..." -ForegroundColor Yellow
try {
    $businessUrl = "https://graph.facebook.com/v21.0/$businessId" + "?access_token=$token"
    $businessResponse = Invoke-RestMethod -Uri $businessUrl -Method GET
    Write-Host "✓ Business account accessible" -ForegroundColor Green
    Write-Host "- Business Name: $($businessResponse.name)" -ForegroundColor Cyan
    Write-Host "- Business ID: $($businessResponse.id)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Cannot access business account!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Send a test message to yourself first
Write-Host "5. Testing Message to a Single Number..." -ForegroundColor Yellow
Write-Host "Enter a phone number to test (format: +94xxxxxxxxx): " -NoNewline
$testPhone = Read-Host

if ($testPhone) {
    try {
        $messageUrl = "https://graph.facebook.com/v21.0/$phoneId/messages"
        $messageBody = @{
            messaging_product = "whatsapp"
            to = $testPhone
            type = "text"
            text = @{
                body = "Test message from Hambrian Glory Community. If you receive this, WhatsApp is working! Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
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
        Write-Host "- WhatsApp ID: $($response.messages[0].message_status)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Please check if you received the message on WhatsApp." -ForegroundColor Yellow
        Write-Host "If not received, this indicates a delivery issue." -ForegroundColor Yellow
    } catch {
        Write-Host "✗ Failed to send test message!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Response: $errorBody" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Check common issues
Write-Host "6. Common WhatsApp Business API Issues:" -ForegroundColor Yellow
Write-Host "   a) Sandbox Mode: Only verified numbers can receive messages" -ForegroundColor White
Write-Host "   b) Template Messages: Some accounts require approved templates" -ForegroundColor White
Write-Host "   c) Phone Number Verification: Recipients may need to be verified" -ForegroundColor White
Write-Host "   d) Business Verification: Account may need business verification" -ForegroundColor White
Write-Host "   e) Rate Limits: Too many messages too quickly" -ForegroundColor White
Write-Host "   f) Quality Rating: Low quality rating affects delivery" -ForegroundColor White

Write-Host ""
Write-Host "7. Next Steps:" -ForegroundColor Yellow
Write-Host "   - Check Facebook Developer Console for account status" -ForegroundColor White
Write-Host "   - Verify if account is in sandbox or production mode" -ForegroundColor White
Write-Host "   - Check if recipient phone numbers need to be verified" -ForegroundColor White
Write-Host "   - Consider using approved message templates" -ForegroundColor White

Write-Host ""
Write-Host "Investigation complete. Check the results above." -ForegroundColor Green
