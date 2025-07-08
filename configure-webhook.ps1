# WhatsApp Webhook Configuration Script
# This script helps you configure the WhatsApp webhook in Facebook Developer Console

Write-Host "=== WhatsApp Webhook Configuration Guide ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Get environment variables
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $token = ($envContent | Where-Object { $_ -like "WHATSAPP_ACCESS_TOKEN=*" }) -replace "WHATSAPP_ACCESS_TOKEN=", ""
    $phoneId = ($envContent | Where-Object { $_ -like "WHATSAPP_PHONE_NUMBER_ID=*" }) -replace "WHATSAPP_PHONE_NUMBER_ID=", ""
    $verifyToken = ($envContent | Where-Object { $_ -like "WHATSAPP_WEBHOOK_VERIFY_TOKEN=*" }) -replace "WHATSAPP_WEBHOOK_VERIFY_TOKEN=", ""
    
    Write-Host "✅ Environment variables loaded:" -ForegroundColor Green
    Write-Host "- Phone Number ID: $phoneId" -ForegroundColor Cyan
    Write-Host "- Webhook Verify Token: $verifyToken" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 WEBHOOK CONFIGURATION STEPS:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. WEBHOOK ENDPOINT SETUP:" -ForegroundColor Cyan
Write-Host "   Your webhook endpoint is ready at:" -ForegroundColor White
Write-Host "   http://localhost:3000/api/whatsapp/webhook" -ForegroundColor Blue
Write-Host ""
Write-Host "   For production, use your domain:" -ForegroundColor White
Write-Host "   https://your-domain.com/api/whatsapp/webhook" -ForegroundColor Blue
Write-Host ""

Write-Host "2. CONFIGURE IN FACEBOOK DEVELOPER CONSOLE:" -ForegroundColor Cyan
Write-Host "   a) Go to https://developers.facebook.com" -ForegroundColor White
Write-Host "   b) Navigate to your app > WhatsApp > Configuration" -ForegroundColor White
Write-Host "   c) In the 'Webhook' section, add:" -ForegroundColor White
Write-Host ""
Write-Host "   Webhook URL: http://localhost:3000/api/whatsapp/webhook" -ForegroundColor Blue
Write-Host "   Verify Token: $verifyToken" -ForegroundColor Blue
Write-Host ""
Write-Host "   d) Subscribe to these webhook fields:" -ForegroundColor White
Write-Host "      ✓ messages (message delivery status)" -ForegroundColor Green
Write-Host "      ✓ message_deliveries (delivery confirmations)" -ForegroundColor Green
Write-Host "      ✓ message_reads (read receipts)" -ForegroundColor Green
Write-Host "      ✓ message_template_status_update (template updates)" -ForegroundColor Green
Write-Host ""

Write-Host "3. WEBHOOK VERIFICATION:" -ForegroundColor Cyan
Write-Host "   The webhook endpoint will automatically verify with Facebook" -ForegroundColor White
Write-Host "   using the verify token from your .env.local file." -ForegroundColor White
Write-Host ""

Write-Host "4. TEST WEBHOOK LOCALLY:" -ForegroundColor Cyan
Write-Host "   a) Make sure your Next.js server is running:" -ForegroundColor White
Write-Host "      npm run dev" -ForegroundColor Blue
Write-Host ""
Write-Host "   b) Use ngrok to expose your local server:" -ForegroundColor White
Write-Host "      ngrok http 3000" -ForegroundColor Blue
Write-Host ""
Write-Host "   c) Use the ngrok URL in Facebook Developer Console:" -ForegroundColor White
Write-Host "      https://your-ngrok-url.ngrok.io/api/whatsapp/webhook" -ForegroundColor Blue
Write-Host ""

Write-Host "5. WEBHOOK FEATURES:" -ForegroundColor Cyan
Write-Host "   ✅ Message delivery tracking" -ForegroundColor Green
Write-Host "   ✅ Read receipt tracking" -ForegroundColor Green
Write-Host "   ✅ Incoming message handling" -ForegroundColor Green
Write-Host "   ✅ Auto-response to keywords" -ForegroundColor Green
Write-Host "   ✅ Comprehensive logging" -ForegroundColor Green
Write-Host "   ✅ Error handling and recovery" -ForegroundColor Green
Write-Host ""

Write-Host "6. MONITORING WEBHOOK ACTIVITY:" -ForegroundColor Cyan
Write-Host "   Webhook logs are saved to:" -ForegroundColor White
Write-Host "   - private/whatsapp-webhooks/webhook-log.json" -ForegroundColor Blue
Write-Host "   - private/whatsapp-webhooks/delivery-status.json" -ForegroundColor Blue
Write-Host ""

Write-Host "7. WEBHOOK DATA FLOW:" -ForegroundColor Cyan
Write-Host "   When you send a WhatsApp message:" -ForegroundColor White
Write-Host "   1. Message is sent via API ✅" -ForegroundColor Green
Write-Host "   2. WhatsApp processes message ✅" -ForegroundColor Green
Write-Host "   3. Webhook receives 'sent' status ✅" -ForegroundColor Green
Write-Host "   4. Webhook receives 'delivered' status ✅" -ForegroundColor Green
Write-Host "   5. Webhook receives 'read' status (if read) ✅" -ForegroundColor Green
Write-Host ""

Write-Host "8. TESTING WEBHOOK:" -ForegroundColor Cyan
Write-Host "   After configuration, test with:" -ForegroundColor White
Write-Host "   powershell -ExecutionPolicy Bypass -File test-webhook-delivery.ps1" -ForegroundColor Blue
Write-Host ""

# Generate test webhook script
Write-Host "9. CREATING TEST SCRIPT:" -ForegroundColor Cyan
$testScript = @"
# Test WhatsApp Webhook Delivery
Write-Host "=== Testing WhatsApp Webhook Delivery ===" -ForegroundColor Cyan
Write-Host ""

# Send test message
Write-Host "Sending test message..." -ForegroundColor Yellow
`$token = "$token"
`$phoneId = "$phoneId"
`$messageUrl = "https://graph.facebook.com/v23.0/`$phoneId/messages"
`$headers = @{
    'Authorization' = "Bearer `$token"
    'Content-Type' = 'application/json'
}

`$messageBody = @{
    messaging_product = "whatsapp"
    to = "+94724222003"
    type = "text"
    text = @{
        body = "🔔 Webhook test message - `$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'). This message will trigger webhook notifications for delivery tracking."
    }
} | ConvertTo-Json -Depth 3

try {
    `$response = Invoke-RestMethod -Uri `$messageUrl -Method POST -Body `$messageBody -Headers `$headers
    Write-Host "✅ Message sent successfully!" -ForegroundColor Green
    Write-Host "- Message ID: `$(`$response.messages[0].id)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Check webhook logs in:" -ForegroundColor Yellow
    Write-Host "- private/whatsapp-webhooks/webhook-log.json" -ForegroundColor Blue
    Write-Host "- private/whatsapp-webhooks/delivery-status.json" -ForegroundColor Blue
    Write-Host ""
    Write-Host "⏰ Wait 10-30 seconds for webhook notifications..." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error sending message: `$(`$_.Exception.Message)" -ForegroundColor Red
}
"@

$testScript | Out-File -FilePath "test-webhook-delivery.ps1" -Encoding UTF8
Write-Host "   ✅ Created test-webhook-delivery.ps1" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Start your Next.js server: npm run dev" -ForegroundColor White
Write-Host "2. Configure webhook in Facebook Developer Console" -ForegroundColor White
Write-Host "3. Test webhook with: test-webhook-delivery.ps1" -ForegroundColor White
Write-Host "4. Monitor webhook logs for delivery status" -ForegroundColor White
Write-Host ""

Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "- If webhook verification fails, check the verify token" -ForegroundColor White
Write-Host "- If no webhook events, ensure fields are subscribed" -ForegroundColor White
Write-Host "- Check server logs for webhook processing errors" -ForegroundColor White
Write-Host "- For production, ensure HTTPS webhook URL" -ForegroundColor White
Write-Host ""

Write-Host "✅ Webhook configuration guide complete!" -ForegroundColor Green
