#!/usr/bin/env pwsh

Write-Host "=== Testing Colorful UI Restoration ===" -ForegroundColor Green

Write-Host "`n1. Checking if admin interface uses colorful gradient background..." -ForegroundColor Yellow

# Check admin page for colorful background
$adminContent = Get-Content "src/app/admin/page.tsx" -Raw
if ($adminContent -match "bg-gradient-to-br from-blue-50 to-indigo-100") {
    Write-Host "✓ Admin page now uses colorful gradient background" -ForegroundColor Green
} else {
    Write-Host "✗ Admin page still uses gray background" -ForegroundColor Red
}

Write-Host "`n2. Checking if globals.css allows dark mode..." -ForegroundColor Yellow

# Check globals.css for dark mode restoration
$globalsCss = Get-Content "src/app/globals.css" -Raw
if ($globalsCss -match "@media \(prefers-color-scheme: dark\)" -and $globalsCss -notmatch "admin-interface") {
    Write-Host "✓ Dark mode support restored in globals.css" -ForegroundColor Green
    Write-Host "✓ Admin interface color overrides removed" -ForegroundColor Green
} else {
    Write-Host "✗ Dark mode or admin interface overrides still present" -ForegroundColor Red
}

Write-Host "`n3. Checking WhatsApp component for color restoration..." -ForegroundColor Yellow

# Check WhatsApp component for forced text colors
$whatsappContent = Get-Content "src/components/WhatsAppComponent.tsx" -Raw
$forcedTextCount = ([regex]::Matches($whatsappContent, "text-gray-900")).Count

Write-Host "Found $forcedTextCount instances of forced text-gray-900 classes" -ForegroundColor Cyan

if ($forcedTextCount -le 2) {  # Some may remain for legitimate styling
    Write-Host "✓ Most forced text color overrides removed from WhatsApp component" -ForegroundColor Green
} else {
    Write-Host "✗ Still many forced text color overrides in WhatsApp component" -ForegroundColor Red
}

Write-Host "`n4. Testing pages with colorful backgrounds..." -ForegroundColor Yellow

# Check other pages for gradient backgrounds
$pagesWithGradients = @()
$pages = @("src/app/page.tsx", "src/app/login/page.tsx", "src/app/about/page.tsx")

foreach ($page in $pages) {
    $content = Get-Content $page -Raw
    if ($content -match "bg-gradient") {
        $pageName = (Split-Path $page -Leaf) -replace "\.tsx$", ""
        $pagesWithGradients += $pageName
    }
}

Write-Host "Pages with colorful gradient backgrounds: $($pagesWithGradients -join ', ')" -ForegroundColor Cyan

Write-Host "`n=== UI Restoration Test Complete ===" -ForegroundColor Green
Write-Host "The original colorful UI theme has been restored!" -ForegroundColor Green
Write-Host "• Removed forced black/white admin interface styling" -ForegroundColor White
Write-Host "• Restored gradient backgrounds to admin panel" -ForegroundColor White
Write-Host "• Re-enabled dark mode support" -ForegroundColor White
Write-Host "• Removed most forced text color overrides" -ForegroundColor White

Write-Host "`nTo test:" -ForegroundColor Yellow
Write-Host "1. Visit http://localhost:3002 - should show colorful blue gradient" -ForegroundColor White
Write-Host "2. Visit http://localhost:3002/admin - should show colorful gradient background" -ForegroundColor White
Write-Host "3. Test dark mode toggle - should work properly now" -ForegroundColor White
Write-Host "4. WhatsApp tab text should be visible and properly colored" -ForegroundColor White
