#!/usr/bin/env pwsh

Write-Host "🔐 Setting up admin password..." -ForegroundColor Cyan

# Import required modules
$scriptDir = $PSScriptRoot
Set-Location $scriptDir

# Admin user details
$adminId = "admin_1"
$adminNIC = "198512345678"
$adminPassword = "admin123"

Write-Host "Creating password for admin user: $adminId" -ForegroundColor Yellow

# Use Node.js to set up the admin password
$nodeScript = @"
const { PasswordService } = require('./src/lib/passwordService.ts');
const path = require('path');

async function setupAdminPassword() {
    try {
        console.log('Setting up admin password...');
        
        // First create temporary password with NIC
        await PasswordService.createTemporaryPassword('$adminId', '$adminNIC');
        console.log('Temporary password created with NIC: $adminNIC');
        
        // Then change to the actual admin password
        const result = await PasswordService.changePassword('$adminId', '$adminNIC', '$adminPassword');
        if (result.success) {
            console.log('✅ Admin password set successfully!');
            console.log('Admin login credentials:');
            console.log('  Email: admin@hambrianglory.lk');
            console.log('  Password: $adminPassword');
        } else {
            console.error('❌ Failed to set admin password:', result.message);
        }
    } catch (error) {
        console.error('❌ Error setting admin password:', error.message);
    }
}

setupAdminPassword();
"@

# Write the Node.js script to a temporary file
$tempFile = "temp_setup_admin.js"
$nodeScript | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Run the Node.js script
    node $tempFile
    
    Write-Host ""
    Write-Host "✅ Admin password setup complete!" -ForegroundColor Green
    Write-Host "You can now login with:" -ForegroundColor Cyan
    Write-Host "  Email: admin@hambrianglory.lk" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error running Node.js script: $_" -ForegroundColor Red
} finally {
    # Clean up temporary file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }
}
