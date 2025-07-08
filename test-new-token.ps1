# Test New WhatsApp Access Token
Write-Host "=== TESTING NEW WHATSAPP ACCESS TOKEN ===" -ForegroundColor Green

Write-Host "Server running on: http://localhost:3003" -ForegroundColor Yellow
Write-Host "Testing WhatsApp with fresh access token..." -ForegroundColor Yellow

# Create test data
$testData = @{
    title = "✅ NEW TOKEN TEST"
    content = "Testing with fresh WhatsApp access token! Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'). If you receive this, the WhatsApp integration is now working correctly! 🎉"
    userIds = $null
} | ConvertTo-Json

try {
    Write-Host "📤 Sending WhatsApp announcement with new token..." -ForegroundColor Cyan
    
    $response = Invoke-WebRequest -Uri "http://localhost:3003/api/whatsapp/announcement" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
    
    Write-Host "📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Parse the JSON response
    $responseData = $response.Content | ConvertFrom-Json
    
    Write-Host "📄 Results:" -ForegroundColor Cyan
    Write-Host "  ✅ Total sent: $($responseData.result.totalSent)" -ForegroundColor Green
    Write-Host "  ❌ Total failed: $($responseData.result.totalFailed)" -ForegroundColor Red
    Write-Host "  👥 Total users: $($responseData.result.totalUsers)" -ForegroundColor Yellow
    
    if ($responseData.result.details) {
        Write-Host "📝 Individual Results:" -ForegroundColor Cyan
        foreach ($detail in $responseData.result.details) {
            $status = if ($detail.success) { 
                "✅ SUCCESS" 
            } else { 
                "❌ FAILED: $($detail.error)" 
            }
            Write-Host "    📱 $($detail.phone) → $status" -ForegroundColor White
        }
    }
    
    # Analysis
    if ($responseData.result.totalSent -eq $responseData.result.totalUsers) {
        Write-Host ""
        Write-Host "🎉 SUCCESS! All users received WhatsApp messages!" -ForegroundColor Green
        Write-Host "✅ WhatsApp integration is now working perfectly!" -ForegroundColor Green
    } elseif ($responseData.result.totalSent -gt 0) {
        Write-Host ""
        Write-Host "🔶 PARTIAL SUCCESS! Some users received messages." -ForegroundColor Yellow
        Write-Host "Check individual results above for details." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ NO MESSAGES SENT! Check server logs for errors." -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Response body: $errorContent" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check the server logs in the terminal where 'npm run dev' is running" -ForegroundColor White
Write-Host "2. Look for detailed WhatsApp API responses" -ForegroundColor White
Write-Host "3. If successful, test through the web interface at http://localhost:3003/admin" -ForegroundColor White
