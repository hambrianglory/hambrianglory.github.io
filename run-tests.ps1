# Community Fee Management System - Test Suite Manager
# Organizes and runs all test scripts in the project

param(
    [string]$Category = "all",
    [switch]$List,
    [switch]$Organize,
    [string]$TestName = ""
)

Write-Host "=== Community Fee Management Test Suite Manager ===" -ForegroundColor Magenta
Write-Host

# Define test categories and their corresponding scripts
$TestCategories = @{
    "auth" = @(
        @{ Name = "test-argon2-auth.ps1"; Description = "Argon2 password encryption and authentication"; Status = "✅ Current" };
        @{ Name = "test-final-auth.ps1"; Description = "Final authentication system testing"; Status = "📝 Legacy" };
        @{ Name = "test-login-final.ps1"; Description = "Login workflow testing"; Status = "📝 Legacy" };
        @{ Name = "test-login-diagnosis.ps1"; Description = "Login troubleshooting and diagnosis"; Status = "📝 Legacy" };
        @{ Name = "test-login-debug.ps1"; Description = "Login debugging utilities"; Status = "📝 Legacy" };
        @{ Name = "test-nic-authentication.ps1"; Description = "NIC-based authentication testing"; Status = "📝 Legacy" };
        @{ Name = "test-admin-login.ps1"; Description = "Admin login functionality"; Status = "📝 Legacy" }
    );
    "admin" = @(
        @{ Name = "test-account-management.ps1"; Description = "Admin account management (unlock/reset)"; Status = "✅ Current" };
        @{ Name = "test-admin-features.ps1"; Description = "Admin dashboard and features"; Status = "✅ Current" };
        @{ Name = "reset-lockout.ps1"; Description = "Reset account lockouts utility"; Status = "🔧 Utility" }
    );
    "features" = @(
        @{ Name = "test-excel-upload.ps1"; Description = "Excel file upload functionality"; Status = "✅ Current" };
        @{ Name = "test-actual-upload.ps1"; Description = "File upload testing"; Status = "✅ Current" };
        @{ Name = "test-overdue-payments.ps1"; Description = "Overdue payment tracking"; Status = "✅ Current" };
        @{ Name = "test-phone-normalization.ps1"; Description = "Phone number normalization"; Status = "✅ Current" };
        @{ Name = "test-profile-pictures.ps1"; Description = "Profile picture upload/management"; Status = "✅ Current" };
        @{ Name = "test-stats-update.ps1"; Description = "Statistics update functionality"; Status = "✅ Current" };
        @{ Name = "test-whatsapp-api.ps1"; Description = "WhatsApp integration"; Status = "✅ Current" };
        @{ Name = "test-member-features.ps1"; Description = "Member-specific features"; Status = "✅ Current" };
        @{ Name = "test-member-tab.ps1"; Description = "Member tab functionality"; Status = "✅ Current" };
        @{ Name = "test-member-role-persistence.ps1"; Description = "Member role persistence"; Status = "✅ Current" };
        @{ Name = "test-edit-features.ps1"; Description = "Data editing features"; Status = "✅ Current" }
    );
    "ui" = @(
        @{ Name = "test-ui-fixes.ps1"; Description = "UI bug fixes and improvements"; Status = "✅ Current" };
        @{ Name = "test-colorful-ui-restoration.ps1"; Description = "UI color scheme restoration"; Status = "✅ Current" };
        @{ Name = "test-demo-data-cleanup.ps1"; Description = "Demo data cleanup"; Status = "✅ Current" }
    )
}

# Function to list all tests
function Show-TestList {
    Write-Host "Available Test Categories:" -ForegroundColor Yellow
    Write-Host
    
    foreach ($category in $TestCategories.Keys) {
        Write-Host "📁 $($category.ToUpper())" -ForegroundColor Cyan
        foreach ($test in $TestCategories[$category]) {
            $statusColor = switch ($test.Status.Split(' ')[0]) {
                "✅" { "Green" }
                "📝" { "Yellow" }
                "🔧" { "Magenta" }
                default { "White" }
            }
            Write-Host "  └─ $($test.Name)" -ForegroundColor $statusColor
            Write-Host "     $($test.Description) [$($test.Status)]" -ForegroundColor Gray
        }
        Write-Host
    }
}

# Function to organize test files
function Move-TestFiles {
    Write-Host "Organizing test files into categories..." -ForegroundColor Yellow
    
    # Create test directories if they don't exist
    $testDirs = @("tests\auth", "tests\admin", "tests\features", "tests\ui", "tests\utils")
    foreach ($dir in $testDirs) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    foreach ($category in $TestCategories.Keys) {
        Write-Host "Moving $category tests..." -ForegroundColor Cyan
        foreach ($test in $TestCategories[$category]) {
            $sourceFile = $test.Name
            $destDir = "tests\$category"
            
            if (Test-Path $sourceFile) {
                Move-Item $sourceFile "$destDir\" -Force
                Write-Host "  ✓ Moved $sourceFile to $destDir" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ File not found: $sourceFile" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "Test file organization complete!" -ForegroundColor Green
}

# Function to run tests by category
function Run-TestCategory {
    param($Category)
    
    if ($Category -eq "all") {
        Write-Host "Running ALL tests..." -ForegroundColor Yellow
        foreach ($cat in $TestCategories.Keys) {
            Run-TestCategory $cat
        }
        return
    }
    
    if (-not $TestCategories.ContainsKey($Category)) {
        Write-Host "Invalid category: $Category" -ForegroundColor Red
        Write-Host "Valid categories: $($TestCategories.Keys -join ', ')" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Running $($Category.ToUpper()) tests..." -ForegroundColor Cyan
    Write-Host "=" * 50
    
    foreach ($test in $TestCategories[$Category]) {
        $testFile = $test.Name
        $testPath = "tests\$Category\$testFile"
        
        # Check if organized, otherwise look in root
        if (-not (Test-Path $testPath)) {
            $testPath = $testFile
        }
        
        if (Test-Path $testPath) {
            Write-Host
            Write-Host "🧪 Running: $($test.Description)" -ForegroundColor Magenta
            Write-Host "📄 File: $testFile" -ForegroundColor Gray
            Write-Host "-" * 30
            
            try {
                & ".\$testPath"
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Test passed: $testFile" -ForegroundColor Green
                } else {
                    Write-Host "❌ Test failed: $testFile (Exit code: $LASTEXITCODE)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Test error: $testFile - $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠ Test file not found: $testFile" -ForegroundColor Yellow
        }
        
        Write-Host
    }
}

# Function to run a specific test
function Run-SpecificTest {
    param($TestName)
    
    $foundTest = $null
    $foundCategory = $null
    
    foreach ($category in $TestCategories.Keys) {
        foreach ($test in $TestCategories[$category]) {
            if ($test.Name -eq $TestName -or $test.Name -eq "$TestName.ps1") {
                $foundTest = $test
                $foundCategory = $category
                break
            }
        }
        if ($foundTest) { break }
    }
    
    if ($foundTest) {
        Write-Host "Running specific test: $($foundTest.Description)" -ForegroundColor Cyan
        Write-Host "Category: $foundCategory" -ForegroundColor Gray
        Write-Host "=" * 50
        
        $testPath = "tests\$foundCategory\$($foundTest.Name)"
        if (-not (Test-Path $testPath)) {
            $testPath = $foundTest.Name
        }
        
        if (Test-Path $testPath) {
            & ".\$testPath"
        } else {
            Write-Host "❌ Test file not found: $($foundTest.Name)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Test not found: $TestName" -ForegroundColor Red
        Write-Host "Use -List to see available tests" -ForegroundColor Yellow
    }
}

# Main execution logic
if ($List) {
    Show-TestList
} elseif ($Organize) {
    Move-TestFiles
} elseif ($TestName) {
    Run-SpecificTest $TestName
} else {
    if ($Category -eq "all") {
        Write-Host "🚀 Running ALL test categories..." -ForegroundColor Green
        Write-Host "This will run: auth, admin, features, ui tests" -ForegroundColor Yellow
        Write-Host
        Read-Host "Press Enter to continue or Ctrl+C to cancel"
    }
    
    Run-TestCategory $Category
}

# Usage examples
Write-Host
Write-Host "Usage Examples:" -ForegroundColor Yellow
Write-Host "  .\run-tests.ps1 -List                    # List all available tests"
Write-Host "  .\run-tests.ps1 -Category auth           # Run authentication tests"
Write-Host "  .\run-tests.ps1 -Category features       # Run feature tests"
Write-Host "  .\run-tests.ps1 -TestName test-argon2-auth.ps1  # Run specific test"
Write-Host "  .\run-tests.ps1 -Organize               # Organize test files into folders"
Write-Host "  .\run-tests.ps1                         # Run all tests"
Write-Host
