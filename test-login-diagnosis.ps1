#!/usr/bin/env pwsh

# Login Diagnosis Tool
# Comprehensive test to identify login issues

Write-Host "🔍 LOGIN DIAGNOSIS TOOL" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test 1: Server Health Check
Write-Host "`n1️⃣  SERVER HEALTH CHECK" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 10
    Write-Host "   ✅ Server is responding (Status: $($healthResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: API Endpoint Check
Write-Host "`n2️⃣  API ENDPOINT CHECK" -ForegroundColor Yellow
$loginData = @{
    email = "admin@hambrianglory.lk"
    password = "198512345678"
} | ConvertTo-Json

Write-Host "   📧 Testing with: admin@hambrianglory.lk" -ForegroundColor White
Write-Host "   🔑 Password: 198512345678 (NIC)" -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $responseData = $response.Content | ConvertFrom-Json
    
    Write-Host "   ✅ API Response: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   📊 Message: $($responseData.message)" -ForegroundColor Cyan
    
    if ($responseData.requiresPasswordChange) {
        Write-Host "   🔄 Password change required: YES" -ForegroundColor Yellow
    } else {
        Write-Host "   🔄 Password change required: NO" -ForegroundColor Green
    }
    
    if ($responseData.user) {
        Write-Host "   👤 User: $($responseData.user.name)" -ForegroundColor Magenta
        Write-Host "   🎯 Role: $($responseData.user.role)" -ForegroundColor Blue
    }
    
} catch {
    Write-Host "   ❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   📊 Status Code: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            $errorData = $errorBody | ConvertFrom-Json
            Write-Host "   💬 Error Message: $($errorData.message)" -ForegroundColor Red
        } catch {
            Write-Host "   💬 Could not parse error response" -ForegroundColor Gray
        }
    }
}

# Test 3: Environment Check
Write-Host "`n3️⃣  ENVIRONMENT CHECK" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $hasJWT = $envContent | Where-Object { $_ -like "JWT_SECRET=*" }
    $hasEncryption = $envContent | Where-Object { $_ -like "PASSWORD_ENCRYPTION_KEY=*" }
    
    if ($hasJWT) {
        Write-Host "   ✅ JWT_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ JWT_SECRET missing" -ForegroundColor Red
    }
    
    if ($hasEncryption) {
        Write-Host "   ✅ PASSWORD_ENCRYPTION_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PASSWORD_ENCRYPTION_KEY missing" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  .env.local file not found" -ForegroundColor Yellow
}

# Test 4: Password File Check
Write-Host "`n4️⃣  PASSWORD STORAGE CHECK" -ForegroundColor Yellow
$passwordDir = "private\passwords"
if (Test-Path $passwordDir) {
    $passwordFiles = Get-ChildItem -Path $passwordDir -Filter "*.pwd"
    Write-Host "   📁 Password directory exists" -ForegroundColor Green
    Write-Host "   📄 Password files: $($passwordFiles.Count)" -ForegroundColor Cyan
    
    if ($passwordFiles.Count -eq 0) {
        Write-Host "   💡 No password files (fresh state - good for testing)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   📁 Password directory missing" -ForegroundColor Yellow
}

# Test 5: Data Storage Check
Write-Host "`n5️⃣  DATA PERSISTENCE CHECK" -ForegroundColor Yellow
$dataDir = "private\data"
if (Test-Path $dataDir) {
    $dataFiles = Get-ChildItem -Path $dataDir -Filter "*.json"
    Write-Host "   📁 Data directory exists" -ForegroundColor Green
    Write-Host "   📄 Data files: $($dataFiles.Count)" -ForegroundColor Cyan
} else {
    Write-Host "   📁 Data directory missing (will be created)" -ForegroundColor Yellow
}

Write-Host "`n🎯 DIAGNOSIS COMPLETE" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "🌐 Login URL: $baseUrl/login" -ForegroundColor Blue
Write-Host "📧 Email: admin@hambrianglory.lk" -ForegroundColor White
Write-Host "🔑 Password: 198512345678" -ForegroundColor White
