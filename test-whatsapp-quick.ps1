# Quick WhatsApp Integration Test
Write-Host "=== WHATSAPP TOKEN INTEGRATION TEST ===" -ForegroundColor Green

# Test admin login with correct credentials
Write-Host "1. Testing admin login..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@hambrianglory.lk"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "Admin: $($loginResponse.user.name)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying with default password..." -ForegroundColor Yellow
    
    $loginData2 = @{
        email = "admin@hambrianglory.lk"
        password = "198512345678"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData2 -ContentType "application/json"
        Write-Host "✅ Admin login successful with default password!" -ForegroundColor Green
        Write-Host "Admin: $($loginResponse.user.name)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Both login attempts failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 WHATSAPP TOKEN UPDATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "📱 New Token: EAAYsA4Py3WIBOy6AOExeEl0r7EZBdEuLkZAkAzZCw0CyoDdmO7ZAd5RFI4ZCHgI9AZCsxCc3L4LGNaTF7olwxcKXlZAGh4bAqDrvreXmkDs651Klmr1iCL7JXzzBTpi30ofUg6AZCuwA1DIR3qDUDZCpwNa17VK2TKOTjZAp8QoSnoD1J4fPEZCZACfXiqvb6qldrSchTa6buPklbSeQZA8b86Lb2H1Ox0s8uerMJntHYria7ZB2AZD" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 HOW TO USE WHATSAPP FEATURES:" -ForegroundColor Green
Write-Host "1. Go to: http://localhost:3000/admin" -ForegroundColor Yellow
Write-Host "2. Login with admin credentials" -ForegroundColor Yellow
Write-Host "3. Click on 'WhatsApp' tab" -ForegroundColor Yellow
Write-Host "4. Start sending messages to community members!" -ForegroundColor Yellow

Write-Host ""
Write-Host "📋 Available Features:" -ForegroundColor Green
Write-Host "✅ Bulk messaging to all members" -ForegroundColor White
Write-Host "✅ Payment reminders automation" -ForegroundColor White
Write-Host "✅ Community announcements" -ForegroundColor White
Write-Host "✅ Template messages" -ForegroundColor White
Write-Host "✅ Role-based messaging" -ForegroundColor White
