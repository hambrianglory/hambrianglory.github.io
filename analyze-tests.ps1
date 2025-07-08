# Test Cleanup and Organization Script
# Helps manage the many test files in this project

Write-Host "=== Test File Cleanup and Organization ===" -ForegroundColor Magenta
Write-Host

# Count current test files
$testFiles = Get-ChildItem -Name "test-*.ps1"
$utilityFiles = Get-ChildItem -Name "reset-*.ps1"
$totalTests = $testFiles.Count + $utilityFiles.Count

Write-Host "Found $totalTests test files:" -ForegroundColor Yellow
Write-Host "  - $($testFiles.Count) test scripts" -ForegroundColor Cyan
Write-Host "  - $($utilityFiles.Count) utility scripts" -ForegroundColor Cyan
Write-Host

# Show current status
Write-Host "Current Test Files:" -ForegroundColor Yellow
foreach ($file in $testFiles) {
    $size = (Get-Item $file).Length
    $lastModified = (Get-Item $file).LastWriteTime.ToString("yyyy-MM-dd")
    Write-Host "  📄 $file ($size bytes, modified: $lastModified)" -ForegroundColor Gray
}

foreach ($file in $utilityFiles) {
    $size = (Get-Item $file).Length
    $lastModified = (Get-Item $file).LastWriteTime.ToString("yyyy-MM-dd")
    Write-Host "  🔧 $file ($size bytes, modified: $lastModified)" -ForegroundColor Gray
}

Write-Host
Write-Host "Recommendations:" -ForegroundColor Green
Write-Host

# Current vs Legacy analysis
$currentTests = @(
    "test-argon2-auth.ps1",
    "test-account-management.ps1", 
    "test-admin-features.ps1",
    "test-excel-upload.ps1",
    "test-actual-upload.ps1",
    "test-overdue-payments.ps1",
    "test-phone-normalization.ps1",
    "test-profile-pictures.ps1",
    "test-stats-update.ps1",
    "test-whatsapp-api.ps1",
    "test-member-features.ps1",
    "test-member-tab.ps1",
    "test-member-role-persistence.ps1",
    "test-edit-features.ps1",
    "test-ui-fixes.ps1",
    "test-colorful-ui-restoration.ps1",
    "test-demo-data-cleanup.ps1"
)

$legacyTests = @(
    "test-final-auth.ps1",
    "test-login-final.ps1",
    "test-login-diagnosis.ps1",
    "test-login-debug.ps1",
    "test-nic-authentication.ps1",
    "test-admin-login.ps1"
)

Write-Host "✅ CURRENT/ACTIVE TESTS ($($currentTests.Count)):" -ForegroundColor Green
foreach ($test in $currentTests) {
    if (Test-Path $test) {
        Write-Host "  ✓ $test" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $test (missing)" -ForegroundColor Yellow
    }
}

Write-Host
Write-Host "📝 LEGACY TESTS ($($legacyTests.Count)):" -ForegroundColor Yellow
foreach ($test in $legacyTests) {
    if (Test-Path $test) {
        Write-Host "  📝 $test (can be archived)" -ForegroundColor Yellow
    }
}

Write-Host
Write-Host "🔧 UTILITY SCRIPTS:" -ForegroundColor Magenta
foreach ($file in $utilityFiles) {
    Write-Host "  🔧 $file" -ForegroundColor Magenta
}

Write-Host
Write-Host "Organization Options:" -ForegroundColor Cyan
Write-Host "1. Use .\run-tests.ps1 -Organize to automatically organize files"
Write-Host "2. Archive legacy tests to keep them for reference"
Write-Host "3. Focus on current tests for daily use"
Write-Host

# Show usage recommendations
Write-Host "Daily Test Usage:" -ForegroundColor Green
Write-Host "  Pre-deployment:   .\run-tests.ps1 -TestName test-argon2-auth.ps1"
Write-Host "  Admin functions:  .\run-tests.ps1 -Category admin"
Write-Host "  Feature testing:  .\run-tests.ps1 -Category features"
Write-Host "  Full regression:  .\run-tests.ps1 -Category all"
Write-Host

# Cleanup suggestions
Write-Host "Cleanup Suggestions:" -ForegroundColor Yellow
Write-Host "1. Archive legacy authentication tests (they're superseded by Argon2 test)"
Write-Host "2. Keep utility scripts for emergency use"
Write-Host "3. Use the test runner for organized execution"
Write-Host "4. Review test documentation: TEST_SUITE_DOCUMENTATION.md"
Write-Host

Write-Host "Test file analysis complete!" -ForegroundColor Green
