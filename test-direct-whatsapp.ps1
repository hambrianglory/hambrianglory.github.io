# Direct WhatsApp API Test
Write-Host "=== DIRECT WHATSAPP API TEST ===" -ForegroundColor Green

Write-Host "Testing WhatsApp announcement endpoint directly..." -ForegroundColor Yellow

# Create test data
$testData = @{
    title = "🧪 Direct API Test"
    content = "This is a direct API test to check WhatsApp functionality. Time: $(Get-Date -Format 'HH:mm:ss')"
    userIds = $null
} | ConvertTo-Json

try {
    Write-Host "📤 Sending POST request to WhatsApp announcement endpoint..." -ForegroundColor Cyan
    
    # Make direct request to the WhatsApp API
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/whatsapp/announcement" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
    
    Write-Host "📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Response Body:" -ForegroundColor Cyan
    Write-Host $response.Content -ForegroundColor White
    
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
Write-Host "📋 After running this test:" -ForegroundColor Yellow
Write-Host "1. Check the server terminal (where npm run dev is running)" -ForegroundColor White
Write-Host "2. Look for detailed WhatsApp API logs" -ForegroundColor White
Write-Host "3. Check if any Facebook API errors are shown" -ForegroundColor White
Write-Host "4. Verify if phone numbers are being processed correctly" -ForegroundColor White
