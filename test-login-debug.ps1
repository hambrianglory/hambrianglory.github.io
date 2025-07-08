# Debug Login Issue Script
# Tests various login scenarios

Write-Host "=== Login Troubleshooting Script ===" -ForegroundColor Green
Write-Host ""

# Test 1: API Health Check
Write-Host "🔧 Testing API Health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/users" -Method GET
    Write-Host "✅ API is responding" -ForegroundColor Green
    Write-Host "   Users count: $($response.users.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ API not responding: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Login API with different credentials
Write-Host "🔐 Testing Login API..." -ForegroundColor Cyan

$credentials = @(
    @{email="admin"; password="admin"},
    @{email="admin@community.com"; password="admin123"},
    @{email="admin@test.com"; password="admin123"}
)

foreach ($cred in $credentials) {
    try {
        $body = @{
            email = $cred.email
            password = $cred.password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
        Write-Host "✅ Login successful for $($cred.email)" -ForegroundColor Green
        Write-Host "   Token starts with: $($response.token.Substring(0, 20))..." -ForegroundColor White
    } catch {
        Write-Host "❌ Login failed for $($cred.email): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Check if server logs show any errors
Write-Host "📋 Server Status:" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3001/login"
Write-Host "   Check browser console for detailed errors"
Write-Host "   Check browser Network tab for API calls"
Write-Host ""

# Test 4: Quick troubleshooting steps
Write-Host "🛠️  TROUBLESHOOTING STEPS:" -ForegroundColor Magenta
Write-Host "1. Open browser Developer Tools (F12)"
Write-Host "2. Go to Console tab"
Write-Host "3. Try login with: admin / admin"
Write-Host "4. Check console for error messages"
Write-Host "5. Go to Network tab and check API calls"
Write-Host ""

Write-Host "🎯 IF STILL NOT WORKING:" -ForegroundColor Red
Write-Host "• Clear browser cache and cookies"
Write-Host "• Try incognito/private browsing mode"
Write-Host "• Check if JavaScript is enabled"
Write-Host "• Restart the development server"
Write-Host ""

Write-Host "🔍 COMMON ISSUES:" -ForegroundColor Yellow
Write-Host "• Browser cache - Clear cache and hard refresh (Ctrl+Shift+R)"
Write-Host "• CORS issues - Check browser console for CORS errors"
Write-Host "• Network issues - Check if localhost:3001 is accessible"
Write-Host "• Token storage - Check if localStorage is working"
Write-Host ""

# Open browser for testing
Write-Host "Opening login page for testing..." -ForegroundColor Cyan
Start-Process "http://localhost:3001/login"
