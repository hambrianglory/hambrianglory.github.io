#!/usr/bin/env pwsh

# Reset Account Lockout Utility
# This script clears any account lockouts for testing

Write-Host "🔓 ACCOUNT LOCKOUT RESET UTILITY" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$passwordDir = "d:\Downloads\System\community-fee-management\private\passwords"

Write-Host "`n🧹 Clearing all password files to reset lockouts..." -ForegroundColor Yellow

try {
    if (Test-Path $passwordDir) {
        $files = Get-ChildItem -Path $passwordDir -Filter "*.pwd"
        if ($files.Count -gt 0) {
            foreach ($file in $files) {
                Remove-Item $file.FullName -Force
                Write-Host "   ✅ Cleared: $($file.Name)" -ForegroundColor Green
            }
            Write-Host "`n🎉 Reset complete! All accounts unlocked." -ForegroundColor Green
        } else {
            Write-Host "   ℹ️  No password files found." -ForegroundColor Gray
        }
    } else {
        Write-Host "   ℹ️  Password directory doesn't exist yet." -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔑 You can now login with:" -ForegroundColor Cyan
Write-Host "   📧 Email: admin@hambrianglory.lk" -ForegroundColor White
Write-Host "   🔑 Password: 198512345678 (NIC number)" -ForegroundColor White
Write-Host "   🌐 URL: http://localhost:3000/login" -ForegroundColor Blue

Write-Host "`n💡 Tip: This resets the account to use NIC as temporary password again." -ForegroundColor Yellow
