# Test WhatsApp with community members
# This script sends test messages to actual community members and asks for confirmation

Write-Host "=== WhatsApp Community Member Test ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Get environment variables
$envFile = ".env.local"
$envContent = Get-Content $envFile
$token = ($envContent | Where-Object { $_ -like "WHATSAPP_ACCESS_TOKEN=*" }) -replace "WHATSAPP_ACCESS_TOKEN=", ""
$phoneId = ($envContent | Where-Object { $_ -like "WHATSAPP_PHONE_NUMBER_ID=*" }) -replace "WHATSAPP_PHONE_NUMBER_ID=", ""

Write-Host "Using Phone Number ID: $phoneId" -ForegroundColor Cyan
Write-Host "Using Token: $($token.Substring(0,20))..." -ForegroundColor Cyan
Write-Host ""

# Read the actual users data
Write-Host "1. Loading Community Members..." -ForegroundColor Yellow
$usersFile = "private/data/users.json"
if (Test-Path $usersFile) {
    $users = Get-Content $usersFile | ConvertFrom-Json
    Write-Host "✓ Found $($users.Count) community members" -ForegroundColor Green
    
    foreach ($user in $users) {
        Write-Host "- $($user.name): $($user.phone)" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ Users file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Ask which member to test with
Write-Host "2. Select a member to test with:" -ForegroundColor Yellow
for ($i = 0; $i -lt $users.Count; $i++) {
    Write-Host "   $($i + 1). $($users[$i].name) - $($users[$i].phone)" -ForegroundColor White
}
Write-Host "Enter number (1-$($users.Count)): " -NoNewline
$selection = Read-Host

try {
    $selectedIndex = [int]$selection - 1
    $selectedUser = $users[$selectedIndex]
    Write-Host "Selected: $($selectedUser.name) - $($selectedUser.phone)" -ForegroundColor Green
} catch {
    Write-Host "Invalid selection!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Send test message
Write-Host "3. Sending Test Message..." -ForegroundColor Yellow
$messageUrl = "https://graph.facebook.com/v21.0/$phoneId/messages"
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

$testMessage = "🔔 Test message from Hambrian Glory Community Fee Management System

Hello $($selectedUser.name)! 

This is a test message to verify WhatsApp delivery is working properly. 

⏰ Sent at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
📱 Your phone: $($selectedUser.phone)

If you receive this message, please reply 'RECEIVED' to confirm delivery is working.

Thank you!
- Community Management Team"

$messageBody = @{
    messaging_product = "whatsapp"
    to = $selectedUser.phone
    type = "text"
    text = @{
        body = $testMessage
    }
} | ConvertTo-Json -Depth 3

try {
    Write-Host "Sending to $($selectedUser.name) at $($selectedUser.phone)..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri $messageUrl -Method POST -Body $messageBody -Headers $headers
    
    Write-Host "✓ Message sent successfully!" -ForegroundColor Green
    Write-Host "- Message ID: $($response.messages[0].id)" -ForegroundColor Cyan
    Write-Host "- Contact: $($response.contacts[0].wa_id)" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "📱 Please ask $($selectedUser.name) to check their WhatsApp and confirm if they received the message." -ForegroundColor Yellow
    Write-Host ""
    
    # Log the test
    $logEntry = @{
        timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        recipient = $selectedUser.name
        phone = $selectedUser.phone
        messageId = $response.messages[0].id
        contactId = $response.contacts[0].wa_id
        status = "sent"
        testType = "manual_verification"
    }
    
    $logFile = "whatsapp-test-log.json"
    $logData = @()
    if (Test-Path $logFile) {
        $logData = Get-Content $logFile | ConvertFrom-Json
    }
    $logData += $logEntry
    $logData | ConvertTo-Json -Depth 3 | Set-Content $logFile
    
    Write-Host "Test logged to: $logFile" -ForegroundColor Gray
    
} catch {
    Write-Host "✗ Failed to send message!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "API Response: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "4. Next Steps:" -ForegroundColor Yellow
Write-Host "   a) Ask the recipient if they received the WhatsApp message" -ForegroundColor White
Write-Host "   b) If NOT received, the issue is likely:" -ForegroundColor White
Write-Host "      - Account is in sandbox mode (needs verified test numbers)" -ForegroundColor Cyan
Write-Host "      - Business verification required" -ForegroundColor Cyan
Write-Host "      - Phone number verification incomplete" -ForegroundColor Cyan
Write-Host "      - Message templates required for this content type" -ForegroundColor Cyan
Write-Host "   c) If RECEIVED, then the system is working correctly!" -ForegroundColor White

Write-Host ""
Write-Host "Test completed. Please verify with the recipient." -ForegroundColor Green
