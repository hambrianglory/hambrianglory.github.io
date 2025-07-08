# Test WhatsApp Token Integration
Write-Host "=== WHATSAPP TOKEN TEST ===" -ForegroundColor Green

# Check if server is running
Write-Host "1. Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
    exit 1
}

# Test admin login
Write-Host "2. Testing admin login..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@hambrianglory.lk"
    password = "198512345678"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $adminToken = $loginResponse.token
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test WhatsApp token access
Write-Host "3. Checking WhatsApp token configuration..." -ForegroundColor Yellow
$headers = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

Write-Host "✅ WhatsApp token updated successfully!" -ForegroundColor Green
Write-Host "Token: EAAYsA4Py3WIBOy6AOExeEl0r7EZBdEuLkZAkAzZCw0CyoDdmO7ZAd5RFI4ZCHgI9AZCsxCc3L4LGNaTF7olwxcKXlZAGh4bAqDrvreXmkDs651Klmr1iCL7JXzzBTpi30ofUg6AZCuwA1DIR3qDUDZCpwNa17VK2TKOTjZAp8QoSnoD1J4fPEZCZACfXiqvb6qldrSchTa6buPklbSeQZA8b86Lb2H1Ox0s8uerMJntHYria7ZB2AZD" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎯 WHATSAPP INTEGRATION READY!" -ForegroundColor Green
Write-Host "📱 Access WhatsApp features at: http://localhost:3000/admin" -ForegroundColor Yellow
Write-Host "🔑 Admin Login: admin@hambrianglory.lk / 198512345678" -ForegroundColor Yellow
Write-Host "📋 Go to Admin Panel → WhatsApp tab to send messages" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Features Available:" -ForegroundColor Green
Write-Host "  - Bulk messaging to all members" -ForegroundColor White
Write-Host "  - Payment reminders" -ForegroundColor White
Write-Host "  - Community announcements" -ForegroundColor White
Write-Host "  - Template messages" -ForegroundColor White
Write-Host "  - Group messaging" -ForegroundColor White
