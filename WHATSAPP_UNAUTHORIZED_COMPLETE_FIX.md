# WhatsApp "Unauthorized" Error - COMPLETE FIX

## 🚨 THE PROBLEM
When you click "Start WhatsApp Session", you get an "unauthorized" error because:
1. The admin authentication token is missing or expired
2. You're not properly logged in as admin
3. WAHA server might not be running

## ✅ COMPLETE SOLUTION

### Step 1: Fix Admin Login
```
1. Open http://localhost:3000/admin
2. If you see login page:
   - Email: admin@hambrianglory.lk
   - Password: admin123
   - Click Login
3. If already logged in, LOG OUT and LOG BACK IN
```

### Step 2: Start WAHA Server
```powershell
# Remove any old containers
docker rm -f $(docker ps -aq --filter name=waha) 2>$null

# Start fresh WAHA server
docker run --name waha-auth-fix -d -p 3001:3000 devlikeapro/waha

# Wait 30 seconds
Start-Sleep 30

# Test if it's working
curl http://localhost:3001/api/sessions
```

### Step 3: Test WhatsApp Session
```
1. Go to admin panel: http://localhost:3000/admin
2. Click "WhatsApp" tab
3. Click "Start WhatsApp Session"
4. Should show: "WhatsApp session started! Please scan QR code..."
```

## 🔧 IF STILL GETTING "UNAUTHORIZED"

### Clear Browser Data
```
1. Press F12 (open developer tools)
2. Go to Application/Storage tab
3. Clear localStorage
4. Close browser completely
5. Reopen and login fresh
```

### Check Token Manually
```javascript
// In browser console (F12), check if token exists:
console.log(localStorage.getItem('token'));
// Should show a long JWT token, not null
```

## 🚀 AUTOMATED FIX SCRIPT

Run this PowerShell script to fix everything:

```powershell
# Stop old containers
docker stop $(docker ps -q --filter name=waha) 2>$null
docker rm $(docker ps -aq --filter name=waha) 2>$null

# Start fresh WAHA
docker run --name waha-new -d -p 3001:3000 devlikeapro/waha

# Wait for startup
Write-Host "Waiting for WAHA to start..." -ForegroundColor Yellow
Start-Sleep 30

# Test connection
try {
    Invoke-RestMethod -Uri "http://localhost:3001/api/sessions"
    Write-Host "✅ WAHA is ready!" -ForegroundColor Green
} catch {
    Write-Host "⏳ WAHA still starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 NOW DO THIS:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:3000/admin" -ForegroundColor White
Write-Host "2. Login: admin@hambrianglory.lk / admin123" -ForegroundColor White
Write-Host "3. Go to WhatsApp tab" -ForegroundColor White
Write-Host "4. Click 'Start WhatsApp Session'" -ForegroundColor White
Write-Host "5. Should work without 'unauthorized' error!" -ForegroundColor Green
```

## 🎯 ROOT CAUSES & FIXES

| Problem | Cause | Fix |
|---------|-------|-----|
| "Unauthorized" | No admin login | Login as admin |
| "Unauthorized" | Expired token | Logout → Login |
| "Unauthorized" | No token in storage | Clear browser data → Login |
| Server error | WAHA not running | Start WAHA container |
| Connection error | Wrong port | Use port 3001 |

## ✅ EXPECTED RESULT
After fixing:
- ✅ "Start WhatsApp Session" works without errors
- ✅ Shows QR code message
- ✅ WAHA server accessible at http://localhost:3001
- ✅ Admin panel shows WhatsApp features

## 🆘 LAST RESORT
If nothing works:
1. Restart your computer
2. Start Docker Desktop manually
3. Run the automated fix script above
4. Fresh browser session (incognito mode)

**The unauthorized error will be gone after proper admin login!** 🎉
