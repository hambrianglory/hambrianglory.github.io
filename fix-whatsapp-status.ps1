#!/usr/bin/env pwsh

Write-Host "🔍 WhatsApp Backend Status Diagnosis" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker Desktop
Write-Host "1. Checking Docker Desktop..." -ForegroundColor Yellow
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcess) {
    Write-Host "   ✅ Docker Desktop is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Docker Desktop is not running" -ForegroundColor Red
    Write-Host "   🚀 Starting Docker Desktop..." -ForegroundColor Blue
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden
    Write-Host "   ⏳ Waiting for Docker to start..." -ForegroundColor Yellow
    Start-Sleep 15
}

# Check Docker CLI
Write-Host ""
Write-Host "2. Checking Docker CLI..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "   ✅ Docker CLI: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker CLI not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Docker CLI error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check existing WAHA containers
Write-Host ""
Write-Host "3. Checking WAHA containers..." -ForegroundColor Yellow
try {
    $containers = docker ps -a --filter "name=waha" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($containers -and $containers.Count -gt 1) {
        Write-Host "   📦 Found WAHA containers:" -ForegroundColor Green
        $containers | Write-Host
    } else {
        Write-Host "   ❌ No WAHA containers found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Cannot check containers: $($_.Exception.Message)" -ForegroundColor Red
}

# Check port 3001
Write-Host ""
Write-Host "4. Checking port 3001..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/sessions" -Method GET -TimeoutSec 5
    Write-Host "   ✅ WAHA server is responding on port 3001" -ForegroundColor Green
    Write-Host "   📊 Sessions: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ WAHA server not responding on port 3001" -ForegroundColor Red
    Write-Host "   🔧 Will attempt to start WAHA server..." -ForegroundColor Blue
}

# Start WAHA if needed
Write-Host ""
Write-Host "5. Starting WAHA server..." -ForegroundColor Yellow
try {
    # Remove any existing waha containers
    docker rm -f waha-server 2>$null
    
    # Start new WAHA container
    $containerId = docker run --name waha-server -d -p 3001:3000 devlikeapro/waha 2>$null
    if ($containerId) {
        Write-Host "   ✅ WAHA container started: $containerId" -ForegroundColor Green
        Write-Host "   ⏳ Waiting for server to initialize..." -ForegroundColor Yellow
        Start-Sleep 10
        
        # Test connection
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3001/api/sessions" -Method GET -TimeoutSec 10
            Write-Host "   ✅ WAHA server is now responding!" -ForegroundColor Green
        } catch {
            Write-Host "   ⏳ Server still starting up (this is normal)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Failed to start WAHA container" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error starting WAHA: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Summary" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "• WAHA Server URL: http://localhost:3001" -ForegroundColor Blue
Write-Host "• Admin Panel: http://localhost:3000/admin" -ForegroundColor Blue
Write-Host "• WhatsApp Tab: Go to admin panel → WhatsApp tab" -ForegroundColor Blue
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Green
Write-Host "1. Open your app: npm run dev" -ForegroundColor White
Write-Host "2. Go to admin panel → WhatsApp tab" -ForegroundColor White
Write-Host "3. Click 'Start WhatsApp Session'" -ForegroundColor White
Write-Host "4. Scan QR code with your phone" -ForegroundColor White
Write-Host ""

# Final status check
Write-Host "🔍 Final Status Check..." -ForegroundColor Cyan
try {
    $finalResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/sessions" -Method GET -TimeoutSec 5
    Write-Host "✅ WhatsApp Backend Status: READY" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WhatsApp Backend Status: STARTING UP" -ForegroundColor Yellow
    Write-Host "   (Wait 1-2 minutes and try again)" -ForegroundColor Yellow
}
