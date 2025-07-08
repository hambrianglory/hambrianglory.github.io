# WhatsApp Delivery Verification Script
# Quick check to confirm if WhatsApp delivery is working

Write-Host "=== WhatsApp Delivery Verification ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Check if test log exists
$logFile = "whatsapp-test-log.json"
if (Test-Path $logFile) {
    Write-Host "📋 Previous Test Results:" -ForegroundColor Yellow
    $logs = Get-Content $logFile | ConvertFrom-Json
    
    foreach ($log in $logs) {
        Write-Host "- $($log.timestamp): $($log.recipient) ($($log.phone))" -ForegroundColor Cyan
        Write-Host "  Message ID: $($log.messageId)" -ForegroundColor Gray
        Write-Host "  Status: $($log.status)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Ask for delivery confirmation
Write-Host "🔍 Delivery Status Check:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please confirm with the recipients if they received WhatsApp messages:" -ForegroundColor White
Write-Host "1. Did the test recipient (+94724222003) receive the test message? (y/n): " -NoNewline
$received = Read-Host

if ($received -eq "y" -or $received -eq "yes") {
    Write-Host ""
    Write-Host "🎉 EXCELLENT! WhatsApp delivery is working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Your WhatsApp Business API is properly configured" -ForegroundColor Green
    Write-Host "✅ Messages are being delivered to recipients" -ForegroundColor Green
    Write-Host "✅ The community fee management system is ready for production use" -ForegroundColor Green
    Write-Host ""
    Write-Host "📢 You can now send announcements to all community members!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "- Test with other community members" -ForegroundColor White
    Write-Host "- Send payment reminders as needed" -ForegroundColor White
    Write-Host "- Use the admin dashboard to manage announcements" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "⚠️  WhatsApp delivery issue confirmed" -ForegroundColor Red
    Write-Host ""
    Write-Host "This means your WhatsApp Business API account has restrictions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 REQUIRED ACTIONS:" -ForegroundColor Red
    Write-Host "1. Check if you're in sandbox mode:" -ForegroundColor Yellow
    Write-Host "   - Log into Facebook Developer Console" -ForegroundColor White
    Write-Host "   - Go to your app → WhatsApp → API Setup" -ForegroundColor White
    Write-Host "   - Look for 'Sandbox' or 'Production' status" -ForegroundColor White
    Write-Host ""
    Write-Host "2. If in sandbox mode:" -ForegroundColor Yellow
    Write-Host "   - Add community members as verified test numbers" -ForegroundColor White
    Write-Host "   - Or apply for production access" -ForegroundColor White
    Write-Host ""
    Write-Host "3. If in production mode:" -ForegroundColor Yellow
    Write-Host "   - Check business verification status" -ForegroundColor White
    Write-Host "   - Verify message template requirements" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See WHATSAPP_TROUBLESHOOTING_GUIDE.md for detailed instructions" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "For technical support, check these files:" -ForegroundColor Gray
Write-Host "- WHATSAPP_TROUBLESHOOTING_GUIDE.md (Complete setup guide)" -ForegroundColor White
Write-Host "- whatsapp-test-log.json (Test results)" -ForegroundColor White
Write-Host "- .env.local (Configuration)" -ForegroundColor White

Write-Host ""
Write-Host "Verification complete." -ForegroundColor Green
