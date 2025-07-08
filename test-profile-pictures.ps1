#!/usr/bin/env pwsh

Write-Host "=== Testing Profile Picture Feature ===" -ForegroundColor Green

Write-Host "`n1. Checking if profile picture directories exist..." -ForegroundColor Yellow

$directories = @(
    "private/profile-pictures",
    "private/profile-pictures/encrypted", 
    "private/profile-pictures/thumbnails"
)

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "✓ Directory exists: $dir" -ForegroundColor Green
    } else {
        Write-Host "✗ Directory missing: $dir" -ForegroundColor Red
    }
}

Write-Host "`n2. Checking required packages..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" | ConvertFrom-Json
$requiredPackages = @("multer", "sharp", "crypto-js", "uuid", "@types/multer")

foreach ($package in $requiredPackages) {
    if ($packageJson.dependencies.$package -or $packageJson.devDependencies.$package) {
        Write-Host "✓ Package installed: $package" -ForegroundColor Green
    } else {
        Write-Host "✗ Package missing: $package" -ForegroundColor Red
    }
}

Write-Host "`n3. Checking API endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "src/app/api/profile-picture/route.ts",
    "src/app/api/profile-picture/view/route.ts"
)

foreach ($endpoint in $endpoints) {
    if (Test-Path $endpoint) {
        Write-Host "✓ API endpoint exists: $endpoint" -ForegroundColor Green
    } else {
        Write-Host "✗ API endpoint missing: $endpoint" -ForegroundColor Red
    }
}

Write-Host "`n4. Checking ProfilePicture component..." -ForegroundColor Yellow

if (Test-Path "src/components/ProfilePicture.tsx") {
    Write-Host "✓ ProfilePicture component exists" -ForegroundColor Green
} else {
    Write-Host "✗ ProfilePicture component missing" -ForegroundColor Red
}

Write-Host "`n5. Checking User type extension..." -ForegroundColor Yellow

$typesContent = Get-Content "src/types/index.ts" -Raw
if ($typesContent -match "profilePicture\?:") {
    Write-Host "✓ User type includes profilePicture field" -ForegroundColor Green
} else {
    Write-Host "✗ User type missing profilePicture field" -ForegroundColor Red
}

Write-Host "`n6. Checking admin panel integration..." -ForegroundColor Yellow

$adminContent = Get-Content "src/app/admin/page.tsx" -Raw
if ($adminContent -match "ProfilePicture") {
    Write-Host "✓ Admin panel includes ProfilePicture component" -ForegroundColor Green
} else {
    Write-Host "✗ Admin panel missing ProfilePicture component" -ForegroundColor Red
}

Write-Host "`n7. Checking environment configuration..." -ForegroundColor Yellow

$envExample = Get-Content ".env.example" -Raw
if ($envExample -match "PROFILE_PICTURE_KEY") {
    Write-Host "✓ Environment example includes profile picture key" -ForegroundColor Green
} else {
    Write-Host "✗ Environment example missing profile picture key" -ForegroundColor Red
}

Write-Host "`n8. Checking gitignore protection..." -ForegroundColor Yellow

$gitignore = Get-Content ".gitignore" -Raw
if ($gitignore -match "/private/") {
    Write-Host "✓ Private directory is protected in gitignore" -ForegroundColor Green
} else {
    Write-Host "✗ Private directory not protected in gitignore" -ForegroundColor Red
}

Write-Host "`n=== Profile Picture Feature Test Complete ===" -ForegroundColor Green

Write-Host "`nFEATURE SUMMARY:" -ForegroundColor Yellow
Write-Host "• Encrypted storage in /private/profile-pictures/encrypted/" -ForegroundColor White
Write-Host "• Thumbnails in /private/profile-pictures/thumbnails/" -ForegroundColor White
Write-Host "• AES-256 encryption for security" -ForegroundColor White
Write-Host "• Image processing (resize, optimize)" -ForegroundColor White
Write-Host "• File validation (type, size, dimensions)" -ForegroundColor White
Write-Host "• Admin panel integration" -ForegroundColor White
Write-Host "• Upload, view, and delete functionality" -ForegroundColor White

Write-Host "`nTO TEST:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:3000/admin" -ForegroundColor White
Write-Host "2. Login with admin credentials" -ForegroundColor White
Write-Host "3. Try adding a new member with profile picture" -ForegroundColor White
Write-Host "4. Upload images for existing members" -ForegroundColor White
Write-Host "5. Verify images are displayed as thumbnails in member list" -ForegroundColor White

Write-Host "`nSECURITY FEATURES:" -ForegroundColor Yellow
Write-Host "• Profile pictures are encrypted with AES-256" -ForegroundColor White
Write-Host "• Stored in private directory (not web accessible)" -ForegroundColor White
Write-Host "• Served through secure API endpoints" -ForegroundColor White
Write-Host "• File type and size validation" -ForegroundColor White
Write-Host "• User authentication required for access" -ForegroundColor White
