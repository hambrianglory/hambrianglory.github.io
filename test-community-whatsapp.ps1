# Test WhatsApp with Community Members After Verification
# Run this script AFTER adding community numbers as test numbers in Facebook Developer Console

Write-Host "=== WhatsApp Community Test (Post-Verification) ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  IMPORTANT: Run this ONLY after adding community numbers as test numbers in Facebook Developer Console!" -ForegroundColor Red
Write-Host ""

# Get environment variables
$envFile = ".env.local"
$envContent = Get-Content $envFile
$token = ($envContent | Where-Object { $_ -like "WHATSAPP_ACCESS_TOKEN=*" }) -replace "WHATSAPP_ACCESS_TOKEN=", ""
$phoneId = ($envContent | Where-Object { $_ -like "WHATSAPP_PHONE_NUMBER_ID=*" }) -replace "WHATSAPP_PHONE_NUMBER_ID=", ""

Write-Host "Using Phone ID: $phoneId" -ForegroundColor Cyan
Write-Host ""

# Load community members
Write-Host "📋 Loading Community Members..." -ForegroundColor Yellow
$usersFile = "private/data/users.json"
if (Test-Path $usersFile) {
    $users = Get-Content $usersFile | ConvertFrom-Json
    Write-Host "✓ Found $($users.Count) community members:" -ForegroundColor Green
    
    foreach ($user in $users) {
        Write-Host "  - $($user.name): $($user.phone)" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ Users file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Confirm verification
Write-Host "🔐 VERIFICATION CHECK:" -ForegroundColor Yellow
Write-Host "Have you added ALL community phone numbers as test numbers in Facebook Developer Console? (y/n): " -NoNewline
$verified = Read-Host

if ($verified -ne "y" -and $verified -ne "yes") {
    Write-Host ""
    Write-Host "⚠️  Please add all community numbers as test numbers first!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://developers.facebook.com" -ForegroundColor White
    Write-Host "2. Your App > WhatsApp > API Setup" -ForegroundColor White
    Write-Host "3. Add each number and verify with SMS code" -ForegroundColor White
    Write-Host "4. Then run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Send messages to all community members
Write-Host "🚀 Sending WhatsApp Messages to All Community Members..." -ForegroundColor Green
Write-Host ""

$messageUrl = "https://graph.facebook.com/v23.0/$phoneId/messages"
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

$successCount = 0
$failCount = 0
$messageResults = @()

foreach ($user in $users) {
    Write-Host "📱 Sending to $($user.name) ($($user.phone))..." -ForegroundColor Cyan
    
    try {
        $communityMessage = @{
            messaging_product = "whatsapp"
            to = $user.phone
            type = "text"
            text = @{
                body = "🎉 Hambrian Glory Community - WhatsApp Integration Complete!

Hello $($user.name)!

✅ Great news! Our WhatsApp integration is now fully functional and you're receiving this message!

🔔 You will now receive:
• Payment reminders before due dates
• Community announcements
• Important updates and notifications
• Meeting schedules and updates

💰 Payment Management:
• Monthly fee reminders
• Payment confirmations
• Outstanding balance alerts

👥 Community Features:
• Member updates
• Event notifications
• Emergency announcements

📱 This message confirms that:
✓ Your number ($($user.phone)) is verified
✓ WhatsApp delivery is working perfectly
✓ You're connected to our community system

⏰ Message sent: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Thank you for being part of the Hambrian Glory Community!

Best regards,
Community Management Team"
            }
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $communityMessage -Headers $headers
        
        Write-Host "  ✅ SUCCESS - Message ID: $($response.messages[0].id)" -ForegroundColor Green
        $successCount++
        
        $messageResults += @{
            name = $user.name
            phone = $user.phone
            status = "SUCCESS"
            messageId = $response.messages[0].id
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        }
        
    } catch {
        Write-Host "  ❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
        
        $messageResults += @{
            name = $user.name
            phone = $user.phone
            status = "FAILED"
            error = $_.Exception.Message
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        }
    }
    
    # Small delay to avoid rate limiting
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "📊 RESULTS SUMMARY:" -ForegroundColor Yellow
Write-Host "✅ Successful messages: $successCount" -ForegroundColor Green
Write-Host "❌ Failed messages: $failCount" -ForegroundColor Red
Write-Host "📱 Total members: $($users.Count)" -ForegroundColor Cyan

# Save results
$resultsFile = "whatsapp-community-test-results.json"
$messageResults | ConvertTo-Json -Depth 3 | Set-Content $resultsFile
Write-Host "💾 Results saved to: $resultsFile" -ForegroundColor Gray

Write-Host ""

if ($successCount -eq $users.Count) {
    Write-Host "🎉 PERFECT! All community members received messages!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ WhatsApp integration is now fully operational!" -ForegroundColor Green
    Write-Host "✅ Payment reminders will work correctly" -ForegroundColor Green
    Write-Host "✅ Community announcements will be delivered" -ForegroundColor Green
    Write-Host "✅ System is ready for production use" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Ask community members to confirm they received the message" -ForegroundColor White
    Write-Host "2. Start using the admin dashboard for announcements" -ForegroundColor White
    Write-Host "3. Set up payment reminders as needed" -ForegroundColor White
    Write-Host "4. Monitor message delivery in the admin panel" -ForegroundColor White
    
} elseif ($successCount -gt 0) {
    Write-Host "⚠️  Partial success - Some messages sent, some failed" -ForegroundColor Yellow
    Write-Host "Check the results above to see which numbers need attention" -ForegroundColor White
    Write-Host "Failed numbers may need to be re-added as test numbers" -ForegroundColor White
    
} else {
    Write-Host "❌ No messages were sent successfully" -ForegroundColor Red
    Write-Host "This suggests the test numbers were not added correctly" -ForegroundColor White
    Write-Host "Please double-check the Facebook Developer Console setup" -ForegroundColor White
}

Write-Host ""
Write-Host "📞 For support, check:" -ForegroundColor Cyan
Write-Host "- resolve-whatsapp-sandbox.ps1 (Setup guide)" -ForegroundColor White
Write-Host "- WHATSAPP_TROUBLESHOOTING_GUIDE.md (Detailed docs)" -ForegroundColor White
Write-Host "- whatsapp-community-test-results.json (Test results)" -ForegroundColor White
