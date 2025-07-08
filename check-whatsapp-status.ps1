# WhatsApp Message Status Checker
# This script checks the delivery status of sent messages

Write-Host "=== WhatsApp Message Status Checker ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Get environment variables
$envFile = ".env.local"
$envContent = Get-Content $envFile
$token = ($envContent | Where-Object { $_ -like "WHATSAPP_ACCESS_TOKEN=*" }) -replace "WHATSAPP_ACCESS_TOKEN=", ""
$phoneId = ($envContent | Where-Object { $_ -like "WHATSAPP_PHONE_NUMBER_ID=*" }) -replace "WHATSAPP_PHONE_NUMBER_ID=", ""

Write-Host "1. Checking Account Limits and Restrictions..." -ForegroundColor Yellow

# Check account messaging limits
try {
    $limitsUrl = "https://graph.facebook.com/v21.0/$phoneId/message_templates?access_token=$token"
    $limitsResponse = Invoke-RestMethod -Uri $limitsUrl -Method GET
    Write-Host "✓ Can access message templates" -ForegroundColor Green
    Write-Host "- Available templates: $($limitsResponse.data.Count)" -ForegroundColor Cyan
    
    if ($limitsResponse.data.Count -eq 0) {
        Write-Host "⚠ No approved message templates found!" -ForegroundColor Red
        Write-Host "  This suggests you're in sandbox mode or need template approval." -ForegroundColor Yellow
    } else {
        Write-Host "- Templates:" -ForegroundColor Cyan
        foreach ($template in $limitsResponse.data) {
            Write-Host "  * $($template.name) - Status: $($template.status)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "✗ Cannot access templates!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check phone number verification status
Write-Host "2. Checking Phone Number Verification Status..." -ForegroundColor Yellow
try {
    $verificationUrl = "https://graph.facebook.com/v21.0/$phoneId/phone_numbers?access_token=$token"
    $verificationResponse = Invoke-RestMethod -Uri $verificationUrl -Method GET
    Write-Host "✓ Phone number verification accessible" -ForegroundColor Green
    Write-Host "Response: $($verificationResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠ Cannot check verification status (this is normal)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Check webhook configuration
Write-Host "3. Checking Webhook Configuration..." -ForegroundColor Yellow
try {
    $webhookUrl = "https://graph.facebook.com/v21.0/$phoneId/webhooks?access_token=$token"
    $webhookResponse = Invoke-RestMethod -Uri $webhookUrl -Method GET
    Write-Host "✓ Webhook configuration accessible" -ForegroundColor Green
    Write-Host "Response: $($webhookResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠ Cannot check webhook status" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test with different message types
Write-Host "4. Testing Different Message Types..." -ForegroundColor Yellow
Write-Host "Enter a verified phone number to test with (format: +94xxxxxxxxx): " -NoNewline
$testPhone = Read-Host

if ($testPhone) {
    $messageUrl = "https://graph.facebook.com/v21.0/$phoneId/messages"
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    
    # Test 1: Simple text message
    Write-Host "   Testing simple text message..." -ForegroundColor Cyan
    try {
        $messageBody = @{
            messaging_product = "whatsapp"
            to = $testPhone
            type = "text"
            text = @{
                body = "Simple test message - $(Get-Date -Format 'HH:mm:ss')"
            }
        } | ConvertTo-Json -Depth 3

        $response = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $messageBody -Headers $headers
        Write-Host "   ✓ Simple message sent - ID: $($response.messages[0].id)" -ForegroundColor Green
        
        # Wait a moment then check status
        Start-Sleep -Seconds 3
        
    } catch {
        Write-Host "   ✗ Simple message failed!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 2: Check if we're in sandbox mode by trying to send to unverified number
    Write-Host "   Testing sandbox mode detection..." -ForegroundColor Cyan
    try {
        $sandboxTestBody = @{
            messaging_product = "whatsapp"
            to = "+1234567890"  # Clearly invalid number
            type = "text"
            text = @{
                body = "Sandbox test"
            }
        } | ConvertTo-Json -Depth 3

        $sandboxResponse = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $sandboxTestBody -Headers $headers
        Write-Host "   ⚠ Sandbox test succeeded - this suggests production mode" -ForegroundColor Yellow
        
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -like "*recipient*" -or $errorMessage -like "*number*" -or $errorMessage -like "*verify*") {
            Write-Host "   ✓ Sandbox mode detected - only verified numbers allowed" -ForegroundColor Green
        } else {
            Write-Host "   ? Sandbox test failed with different error: $errorMessage" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Recommendations based on findings
Write-Host "5. Recommendations:" -ForegroundColor Yellow
Write-Host "   If messages show as sent but aren't received:" -ForegroundColor White
Write-Host "   a) You may be in sandbox mode - only verified test numbers work" -ForegroundColor Cyan
Write-Host "   b) For production use, you need:" -ForegroundColor Cyan
Write-Host "      - Business verification" -ForegroundColor White
Write-Host "      - Approved message templates for promotional content" -ForegroundColor White
Write-Host "      - Phone number verification complete" -ForegroundColor White
Write-Host "   c) Check Facebook Business Manager for account status" -ForegroundColor Cyan
Write-Host "   d) Consider using only verified test numbers for now" -ForegroundColor Cyan

Write-Host ""
Write-Host "6. To verify if you're in sandbox mode:" -ForegroundColor Yellow
Write-Host "   - Log into Facebook Developer Console" -ForegroundColor White
Write-Host "   - Go to your app > WhatsApp > API Setup" -ForegroundColor White
Write-Host "   - Check if it says 'Sandbox' or 'Production'" -ForegroundColor White
Write-Host "   - In sandbox, add test numbers in the console" -ForegroundColor White

Write-Host ""
Write-Host "Investigation complete!" -ForegroundColor Green
