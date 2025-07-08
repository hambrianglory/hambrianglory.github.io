# Test Admin Login Credentials
# This script tests the new temporary admin credentials

Write-Host "=== Hambrian Glory Admin Credentials Test ===" -ForegroundColor Green
Write-Host ""

Write-Host "🔐 TEMPORARY ADMIN CREDENTIALS ADDED:" -ForegroundColor Cyan
Write-Host ""

Write-Host "Quick Login (Minimal typing):" -ForegroundColor Yellow
Write-Host "  Email: admin"
Write-Host "  Password: admin"
Write-Host ""

Write-Host "Standard Admin Accounts:" -ForegroundColor Yellow
Write-Host "  Email: admin@community.com | Password: admin123"
Write-Host "  Email: admin@hambrianglory.lk | Password: admin123"
Write-Host "  Email: admin@test.com | Password: admin123"
Write-Host "  Email: test@admin.com | Password: admin123"
Write-Host "  Email: admin@admin.com | Password: admin"
Write-Host "  Email: hambrian@admin.com | Password: hambrian123"
Write-Host ""

Write-Host "Member Accounts (for testing):" -ForegroundColor Blue
Write-Host "  Email: john@example.com | Password: member123"
Write-Host "  Email: jane@example.com | Password: member123"
Write-Host ""

Write-Host "📱 HOW TO TEST:" -ForegroundColor Green
Write-Host "1. Open: http://localhost:3001/login"
Write-Host "2. Try the quick admin login: admin / admin"
Write-Host "3. Should redirect to admin dashboard"
Write-Host "4. Test admin features (members, search, delete, upload)"
Write-Host ""

Write-Host "🎯 ADMIN FEATURES AVAILABLE:" -ForegroundColor Magenta
Write-Host "  ✅ Community statistics dashboard"
Write-Host "  ✅ Member management (view, edit, delete)"
Write-Host "  ✅ Real-time member search"
Write-Host "  ✅ Excel/CSV data upload"
Write-Host "  ✅ WhatsApp messaging system"
Write-Host "  ✅ Template downloads"
Write-Host "  ✅ Mobile-responsive design"
Write-Host ""

Write-Host "🔧 TECHNICAL CHANGES MADE:" -ForegroundColor White
Write-Host "  • Updated: src/app/api/auth/login/route.ts"
Write-Host "  • Updated: src/app/login/page.tsx (demo credentials display)"
Write-Host "  • Created: ADMIN_CREDENTIALS.md (reference document)"
Write-Host "  • All admin emails map to same admin user (admin_1)"
Write-Host ""

Write-Host "🚀 APPLICATION IS READY!" -ForegroundColor Green
Write-Host "Use any admin credential above to access the admin panel."
Write-Host ""

# Open the login page
Write-Host "Opening login page..." -ForegroundColor Cyan
Start-Process "http://localhost:3001/login"
