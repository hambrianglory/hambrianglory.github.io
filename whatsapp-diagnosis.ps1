# WhatsApp Configuration Analysis
Write-Host "=== WHATSAPP CONFIGURATION ANALYSIS ===" -ForegroundColor Green

Write-Host "1. Checking user database..." -ForegroundColor Yellow
try {
    $usersJson = Get-Content "private\data\users.json" -Raw | ConvertFrom-Json
    $activeMembers = $usersJson | Where-Object { $_.role -eq "member" -and $_.isActive -eq $true }
    
    Write-Host "📊 Database Analysis:" -ForegroundColor Cyan
    Write-Host "  Total users in database: $($usersJson.Count)" -ForegroundColor White
    Write-Host "  Active members: $($activeMembers.Count)" -ForegroundColor White
    
    Write-Host "📱 Phone numbers that should receive messages:" -ForegroundColor Cyan
    foreach ($member in $activeMembers) {
        $phoneStatus = if ($member.phone -like "+94*") { "✅ Valid format" } else { "⚠️ May need formatting" }
        Write-Host "  👤 $($member.name): $($member.phone) - $phoneStatus" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Cannot read user database: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Checking WhatsApp configuration..." -ForegroundColor Yellow
try {
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "WHATSAPP_ACCESS_TOKEN=(.+)") {
        $token = $matches[1].Substring(0, [Math]::Min(20, $matches[1].Length))
        Write-Host "✅ WhatsApp Access Token: $token..." -ForegroundColor Green
    } else {
        Write-Host "❌ WhatsApp Access Token: NOT FOUND" -ForegroundColor Red
    }
    
    if ($envContent -match "WHATSAPP_PHONE_NUMBER_ID=(.+)") {
        $phoneId = $matches[1]
        if ($phoneId -eq "YOUR_PHONE_NUMBER_ID_HERE") {
            Write-Host "❌ WhatsApp Phone Number ID: NOT CONFIGURED (placeholder)" -ForegroundColor Red
        } else {
            Write-Host "✅ WhatsApp Phone Number ID: $phoneId" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ WhatsApp Phone Number ID: NOT FOUND" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot read .env.local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 DIAGNOSIS:" -ForegroundColor Yellow
Write-Host "The issue is that messages show as 'successful' but only +94724222003 receives them because:" -ForegroundColor White
Write-Host ""
Write-Host "❌ MISSING: WhatsApp Phone Number ID" -ForegroundColor Red
Write-Host "   Without this, the Facebook Graph API cannot send messages" -ForegroundColor White
Write-Host "   The system falls back to 'demo mode' and only simulates sending" -ForegroundColor White

Write-Host ""
Write-Host "📋 TO FIX THIS ISSUE:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Get your WhatsApp Phone Number ID:" -ForegroundColor Yellow
Write-Host "   • Go to Facebook Developer Console" -ForegroundColor White
Write-Host "   • Navigate to your WhatsApp Business app" -ForegroundColor White
Write-Host "   • Go to WhatsApp > Configuration" -ForegroundColor White
Write-Host "   • Copy the Phone Number ID (looks like: 123456789012345)" -ForegroundColor White

Write-Host ""
Write-Host "2. Add it to your environment:" -ForegroundColor Yellow
Write-Host "   • Edit .env.local file" -ForegroundColor White
Write-Host "   • Replace: WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID_HERE" -ForegroundColor White
Write-Host "   • With: WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_number_id" -ForegroundColor White

Write-Host ""
Write-Host "3. Restart the server:" -ForegroundColor Yellow
Write-Host "   • Stop the current server (Ctrl+C)" -ForegroundColor White
Write-Host "   • Run: npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "4. Test again:" -ForegroundColor Yellow
Write-Host "   • All members should receive messages" -ForegroundColor White
Write-Host "   • Not just +94724222003" -ForegroundColor White

Write-Host ""
Write-Host "📱 Expected Recipients After Fix:" -ForegroundColor Cyan
Write-Host "   • Test (+94724222003) ✅ Currently working" -ForegroundColor Green
Write-Host "   • Test Member (+94771111111) ❌ Should work after fix" -ForegroundColor Red
Write-Host "   • Profile Test User (+94771234567) ❌ Should work after fix" -ForegroundColor Red
