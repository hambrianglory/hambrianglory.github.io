# Test WhatsApp Webhook Delivery
Write-Host "=== Testing WhatsApp Webhook Delivery ===" -ForegroundColor Cyan
Write-Host ""

# Send test message
Write-Host "Sending test message..." -ForegroundColor Yellow
$token = "EAAYsA4Py3WIBOZBvxOF9qqYpLbQ7E6DJEjC0BP5OsS2SeHD7oZC4159x8jgBkwaWodTypwMKl1wflX3XS6BlrLmLZB9ENAClAFP3RRZBCo9KeDCUBHw6Jj89Dxc7N1LXmD9KYrh8kAsP6ZCR7CLD6yycUIZB8YZBuEZCV1SOdeY9y1BgAN8cdT1bhkbYo2nZCVctsEOquu18o0jUdITlcrnJjgdo9ZCND66gbo"
$phoneId = "632485386624418"
$messageUrl = "https://graph.facebook.com/v23.0/$phoneId/messages"
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

$messageBody = @{
    messaging_product = "whatsapp"
    to = "+94724222003"
    type = "text"
    text = @{
        body = "🔔 Webhook test message - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'). This message will trigger webhook notifications for delivery tracking."
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $messageBody -Headers $headers
    Write-Host "✅ Message sent successfully!" -ForegroundColor Green
    Write-Host "- Message ID: $($response.messages[0].id)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Check webhook logs in:" -ForegroundColor Yellow
    Write-Host "- private/whatsapp-webhooks/webhook-log.json" -ForegroundColor Blue
    Write-Host "- private/whatsapp-webhooks/delivery-status.json" -ForegroundColor Blue
    Write-Host ""
    Write-Host "⏰ Wait 10-30 seconds for webhook notifications..." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error sending message: $($_.Exception.Message)" -ForegroundColor Red
}
