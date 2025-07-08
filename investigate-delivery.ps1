# WhatsApp Delivery Investigation
Write-Host "=== WHATSAPP DELIVERY INVESTIGATION ===" -ForegroundColor Green

Write-Host "📊 API shows messages sent successfully but not received by users" -ForegroundColor Yellow
Write-Host "This is a common WhatsApp Business API issue. Let's investigate..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 POSSIBLE CAUSES:" -ForegroundColor Cyan

Write-Host "1. WhatsApp Business Account Status" -ForegroundColor Yellow
Write-Host "   • Your account might be in SANDBOX mode" -ForegroundColor White
Write-Host "   • Sandbox mode only allows messages to verified test numbers" -ForegroundColor White
Write-Host "   • Production mode requires business verification" -ForegroundColor White

Write-Host "2. Phone Number Verification" -ForegroundColor Yellow
Write-Host "   • Recipients may need to be added as test users" -ForegroundColor White
Write-Host "   • Check Facebook Developer Console > WhatsApp > Phone Numbers" -ForegroundColor White

Write-Host "3. Message Template Requirements" -ForegroundColor Yellow
Write-Host "   • Some regions require approved message templates" -ForegroundColor White
Write-Host "   • Free-form messages may be blocked" -ForegroundColor White

Write-Host "4. Rate Limiting or Policies" -ForegroundColor Yellow
Write-Host "   • WhatsApp may be silently dropping messages" -ForegroundColor White
Write-Host "   • Business policy violations" -ForegroundColor White

Write-Host ""
Write-Host "💡 SOLUTIONS TO TRY:" -ForegroundColor Green

Write-Host "1. Check Account Status:" -ForegroundColor Yellow
Write-Host "   • Go to Facebook Developer Console" -ForegroundColor White
Write-Host "   • Check if account is in Sandbox or Production mode" -ForegroundColor White
Write-Host "   • Look for any warnings or restrictions" -ForegroundColor White

Write-Host "2. Add Test Numbers:" -ForegroundColor Yellow
Write-Host "   • In Developer Console > WhatsApp > Phone Numbers" -ForegroundColor White
Write-Host "   • Add +94724222003, +94771111111, +94771234567 as test numbers" -ForegroundColor White

Write-Host "3. Try a Simple Test Message:" -ForegroundColor Yellow
Write-Host "   • Send 'Hello' to just one number first" -ForegroundColor White
Write-Host "   • Use approved template if available" -ForegroundColor White

Write-Host "4. Check Message Format:" -ForegroundColor Yellow
Write-Host "   • Avoid emojis and special characters" -ForegroundColor White
Write-Host "   • Keep messages short and simple" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Let's test with a simple message..." -ForegroundColor Cyan

# Test with simple message to one number
$simpleTestData = @{
    title = "Test"
    content = "Hello, this is a simple test message."
    userIds = @("user_1751404508969")  # Just the first user
} | ConvertTo-Json

try {
    Write-Host "📤 Sending simple test to +94724222003 only..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri "http://localhost:3003/api/whatsapp/announcement" -Method POST -Body $simpleTestData -ContentType "application/json" -UseBasicParsing
    
    $responseData = $response.Content | ConvertFrom-Json
    
    Write-Host "📊 Simple Test Results:" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Sent: $($responseData.result.totalSent)" -ForegroundColor White
    Write-Host "  Failed: $($responseData.result.totalFailed)" -ForegroundColor White
    
    if ($responseData.result.details) {
        foreach ($detail in $responseData.result.details) {
            Write-Host "  $($detail.phone): $(if ($detail.success) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ Simple test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 IMMEDIATE ACTIONS:" -ForegroundColor Yellow
Write-Host "1. Check Facebook Developer Console for account status" -ForegroundColor White
Write-Host "2. Add recipient numbers as test users if in sandbox mode" -ForegroundColor White
Write-Host "3. Look for any error messages or warnings in the console" -ForegroundColor White
Write-Host "4. Try sending a message manually through the API Explorer" -ForegroundColor White

Write-Host ""
Write-Host "🔗 USEFUL LINKS:" -ForegroundColor Cyan
Write-Host "• Facebook Developer Console: https://developers.facebook.com/" -ForegroundColor White
Write-Host "• WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp" -ForegroundColor White
Write-Host "• API Explorer: https://developers.facebook.com/tools/explorer/" -ForegroundColor White
