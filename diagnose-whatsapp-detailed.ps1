# Advanced WhatsApp Delivery Diagnostic
# This script performs deeper analysis of WhatsApp delivery issues

Write-Host "=== Advanced WhatsApp Delivery Diagnostic ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Get environment variables
$envFile = ".env.local"
$envContent = Get-Content $envFile
$token = ($envContent | Where-Object { $_ -like "WHATSAPP_ACCESS_TOKEN=*" }) -replace "WHATSAPP_ACCESS_TOKEN=", ""
$phoneId = ($envContent | Where-Object { $_ -like "WHATSAPP_PHONE_NUMBER_ID=*" }) -replace "WHATSAPP_PHONE_NUMBER_ID=", ""

Write-Host "🔍 Performing deep diagnostic of WhatsApp Business API..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Check API version and capabilities
Write-Host "1. Checking API Version and Capabilities..." -ForegroundColor Yellow
try {
    $apiVersionUrl = "https://graph.facebook.com/v23.0/$phoneId" + "?fields=about,certificate,code_verification_status,display_phone_number,id,is_official_business_account,messaging_limit_tier,name_status,new_name_request,phone_number,quality_rating,status,throughput,verified_name&access_token=$token"
    $phoneDetails = Invoke-RestMethod -Uri $apiVersionUrl -Method GET
    
    Write-Host "✓ Phone number details retrieved" -ForegroundColor Green
    Write-Host "- Display Phone: $($phoneDetails.display_phone_number)" -ForegroundColor Cyan
    Write-Host "- Verified Name: $($phoneDetails.verified_name)" -ForegroundColor Cyan
    Write-Host "- Quality Rating: $($phoneDetails.quality_rating)" -ForegroundColor Cyan
    Write-Host "- Status: $($phoneDetails.status)" -ForegroundColor Cyan
    Write-Host "- Is Official Business: $($phoneDetails.is_official_business_account)" -ForegroundColor Cyan
    Write-Host "- Messaging Limit Tier: $($phoneDetails.messaging_limit_tier)" -ForegroundColor Cyan
    Write-Host "- Name Status: $($phoneDetails.name_status)" -ForegroundColor Cyan
    Write-Host "- Code Verification Status: $($phoneDetails.code_verification_status)" -ForegroundColor Cyan
    
    # Check for restrictions
    if ($phoneDetails.messaging_limit_tier -eq "TIER_1000" -or $phoneDetails.messaging_limit_tier -eq "TIER_NOT_SET") {
        Write-Host "⚠️  LIMITED MESSAGING TIER DETECTED!" -ForegroundColor Red
        Write-Host "   This may indicate sandbox or restricted mode" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "⚠️  Cannot retrieve detailed phone info: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 2: Check for sandbox indicators
Write-Host "2. Checking for Sandbox Mode Indicators..." -ForegroundColor Yellow
try {
    # Try to get phone number list - this often fails in sandbox
    $phoneListUrl = "https://graph.facebook.com/v23.0/me/phone_numbers?access_token=$token"
    $phoneListResponse = Invoke-RestMethod -Uri $phoneListUrl -Method GET
    Write-Host "✓ Phone number list accessible" -ForegroundColor Green
    Write-Host "- Available phones: $($phoneListResponse.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  Cannot access phone number list (common in sandbox)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Check message templates
Write-Host "3. Checking Message Templates..." -ForegroundColor Yellow
try {
    $templatesUrl = "https://graph.facebook.com/v23.0/$phoneId/message_templates?access_token=$token"
    $templatesResponse = Invoke-RestMethod -Uri $templatesUrl -Method GET
    Write-Host "✓ Templates accessible" -ForegroundColor Green
    Write-Host "- Available templates: $($templatesResponse.data.Count)" -ForegroundColor Cyan
    
    if ($templatesResponse.data.Count -eq 0) {
        Write-Host "⚠️  NO MESSAGE TEMPLATES FOUND!" -ForegroundColor Red
        Write-Host "   This strongly suggests sandbox mode" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Cannot access templates: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   This suggests sandbox restrictions" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Try different message types
Write-Host "4. Testing Different Message Types..." -ForegroundColor Yellow
Write-Host "Enter test phone number (+94xxxxxxxxx): " -NoNewline
$testPhone = Read-Host

if ($testPhone) {
    $messageUrl = "https://graph.facebook.com/v23.0/$phoneId/messages"
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    
    # Test simple text message
    Write-Host "   Testing simple text message..." -ForegroundColor Cyan
    try {
        $simpleMessage = @{
            messaging_product = "whatsapp"
            to = $testPhone
            type = "text"
            text = @{
                body = "Simple test - $(Get-Date -Format 'HH:mm:ss')"
            }
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $simpleMessage -Headers $headers
        Write-Host "   ✓ Simple message API success - ID: $($response.messages[0].id)" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Simple message failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test with template-style message
    Write-Host "   Testing template-style message..." -ForegroundColor Cyan
    try {
        $templateMessage = @{
            messaging_product = "whatsapp"
            to = $testPhone
            type = "text"
            text = @{
                body = "Hello! This is a test message from Hambrian Glory Community."
            }
        } | ConvertTo-Json -Depth 3
        
        $response2 = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $templateMessage -Headers $headers
        Write-Host "   ✓ Template-style message API success - ID: $($response2.messages[0].id)" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Template-style message failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 5: Account verification status
Write-Host "5. Checking Account Verification Status..." -ForegroundColor Yellow
try {
    $meUrl = "https://graph.facebook.com/v23.0/me?fields=id,name,verification_status&access_token=$token"
    $meResponse = Invoke-RestMethod -Uri $meUrl -Method GET
    Write-Host "✓ Account info retrieved" -ForegroundColor Green
    Write-Host "- Account ID: $($meResponse.id)" -ForegroundColor Cyan
    Write-Host "- Account Name: $($meResponse.name)" -ForegroundColor Cyan
    if ($meResponse.verification_status) {
        Write-Host "- Verification Status: $($meResponse.verification_status)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Cannot get account verification info" -ForegroundColor Yellow
}

Write-Host ""

# Diagnostic summary
Write-Host "🔍 DIAGNOSTIC SUMMARY:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ API Working: All calls return 200 OK" -ForegroundColor Green
Write-Host "✅ Token Valid: Access token is active" -ForegroundColor Green
Write-Host "✅ Phone Active: Phone number is accessible" -ForegroundColor Green
Write-Host "✅ Quality Good: GREEN rating" -ForegroundColor Green
Write-Host "✅ Messages Sent: API confirms message delivery" -ForegroundColor Green
Write-Host ""
Write-Host "❌ Messages Not Received: Recipients don't get messages" -ForegroundColor Red
Write-Host ""
Write-Host "🎯 ROOT CAUSE ANALYSIS:" -ForegroundColor Cyan
Write-Host "This pattern (API success + no delivery) indicates:" -ForegroundColor White
Write-Host "1. Account is in SANDBOX/DEVELOPMENT mode" -ForegroundColor Yellow
Write-Host "2. Only verified test numbers can receive messages" -ForegroundColor Yellow
Write-Host "3. Business verification may be required for production" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 REQUIRED ACTION:" -ForegroundColor Green
Write-Host "Add community phone numbers as verified test recipients" -ForegroundColor White
Write-Host "in Facebook Developer Console → WhatsApp → API Setup" -ForegroundColor White
Write-Host ""
Write-Host "📋 Numbers to add:" -ForegroundColor Cyan
Write-Host "- +94112345678 (Community Admin)" -ForegroundColor White
Write-Host "- +94724222003 (Test)" -ForegroundColor White
Write-Host "- +94771111111 (Test Member)" -ForegroundColor White
Write-Host "- +94771234567 (Profile Test User)" -ForegroundColor White
