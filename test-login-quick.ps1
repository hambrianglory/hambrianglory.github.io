#!/usr/bin/env pwsh

Write-Host "=== QUICK LOGIN HISTORY TEST ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3005"

# Try to get admin token from a known working login
Write-Host "Attempting admin login..." -ForegroundColor Yellow

try {
    # Clear password cache and try login
    Remove-Item "private\passwords\admin_1.pwd" -Force -ErrorAction SilentlyContinue
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (@{
        email = "admin@hambrianglory.lk"
        password = "198512345678"
    } | ConvertTo-Json) -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ Admin login successful!" -ForegroundColor Green
        
        $headers = @{ "Authorization" = "Bearer $($loginResponse.token)" }
        
        # Test login history API
        Write-Host "Testing login history API..." -ForegroundColor Yellow
        $historyResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/login-history?statsOnly=true" -Headers $headers
        
        if ($historyResponse.success) {
            Write-Host "✅ Login history API working!" -ForegroundColor Green
            Write-Host "Stats:" -ForegroundColor Cyan
            $stats = $historyResponse.stats
            Write-Host "  Total logins: $($stats.totalLogins)" -ForegroundColor White
            Write-Host "  Successful: $($stats.successfulLogins)" -ForegroundColor Green
            Write-Host "  Failed: $($stats.failedLogins)" -ForegroundColor Red
            Write-Host "  Admin logins: $($stats.adminLogins)" -ForegroundColor Yellow
            Write-Host "  Member logins: $($stats.memberLogins)" -ForegroundColor Blue
            
        } else {
            Write-Host "❌ Login history API returned error" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Login failed - no token received" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "🎯 TO TEST THE UI:" -ForegroundColor Cyan
Write-Host "1. Go to: http://localhost:3005/login" -ForegroundColor White
Write-Host "2. Login with: admin@hambrianglory.lk / 198512345678" -ForegroundColor White
Write-Host "3. Look for 'Login History' tab in admin panel" -ForegroundColor White
