# WhatsApp API Test Script for Hambrian Glory Community Fee Management
# This script tests all WhatsApp API endpoints

Write-Host "Testing WhatsApp API Endpoints..." -ForegroundColor Green
Write-Host "Server: http://localhost:3004" -ForegroundColor Yellow
Write-Host ""

# Test 1: Announcement API
Write-Host "1. Testing Announcement API..." -ForegroundColor Cyan
$announcementBody = @{
    title = "Community Meeting Reminder"
    content = "Don't forget about our monthly community meeting this Saturday at 7:00 PM in the community hall. We'll be discussing the new security measures and budget planning."
    userIds = @("user_1", "user_2", "user_3")
} | ConvertTo-Json

try {
    $announcementResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/announcement" -Method POST -Body $announcementBody -ContentType "application/json"
    Write-Host "✓ Announcement sent successfully!" -ForegroundColor Green
    Write-Host "  Total sent: $($announcementResult.result.totalSent)" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "✗ Announcement failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Payment Reminder API
Write-Host "2. Testing Payment Reminder API..." -ForegroundColor Cyan
$paymentBody = @{
    userIds = @("user_1", "user_2")
    amount = 3500
    dueDate = "2025-08-15"
    description = "Monthly maintenance fee + elevator service charge"
} | ConvertTo-Json

try {
    $paymentResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/payment-reminder" -Method POST -Body $paymentBody -ContentType "application/json"
    Write-Host "✓ Payment reminder sent successfully!" -ForegroundColor Green
    Write-Host "  Total sent: $($paymentResult.result.totalSent)" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "✗ Payment reminder failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Emergency Alert API
Write-Host "3. Testing Emergency Alert API..." -ForegroundColor Cyan
$emergencyBody = @{
    emergencyType = "Fire Safety Alert"
    details = "Fire alarm testing will be conducted in all buildings from 10:00 AM to 12:00 PM today. This is a scheduled test."
    actionRequired = "Please do not evacuate during this time unless instructed by security. Normal fire safety protocols will resume at 12:00 PM."
    userIds = @("user_1", "user_2", "user_3")
} | ConvertTo-Json

try {
    $emergencyResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/emergency" -Method POST -Body $emergencyBody -ContentType "application/json"
    Write-Host "✓ Emergency alert sent successfully!" -ForegroundColor Green
    Write-Host "  Total sent: $($emergencyResult.result.totalSent)" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "✗ Emergency alert failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Configuration API
Write-Host "4. Testing Configuration API..." -ForegroundColor Cyan
$configBody = @{
    businessPhoneId = "123456789012345"
    accessToken = "EAABwxxxxxxxxxxxxxxx"
    webhookVerifyToken = "hambrian_glory_webhook_2025"
    isEnabled = $true
} | ConvertTo-Json

try {
    $configResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/config" -Method POST -Body $configBody -ContentType "application/json"
    Write-Host "✓ Configuration updated successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Configuration update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Configuration
Write-Host "5. Testing Get Configuration..." -ForegroundColor Cyan
try {
    $getConfigResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/config" -Method GET
    Write-Host "✓ Configuration retrieved successfully!" -ForegroundColor Green
    Write-Host "  Templates available: $($getConfigResult.templates.Count)" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "✗ Get configuration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "WhatsApp API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure real WhatsApp Business API credentials in .env.local" -ForegroundColor White
Write-Host "2. Test with real phone numbers (Sri Lankan format: +94xxxxxxxxx)" -ForegroundColor White
Write-Host "3. Set up webhook URL for production deployment" -ForegroundColor White
Write-Host "4. Monitor message delivery status in production" -ForegroundColor White
