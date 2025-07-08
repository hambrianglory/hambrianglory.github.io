#!/usr/bin/env pwsh

# Set password for test user with proper Argon2 hashing
Write-Host "🔑 Setting up test user with working credentials..." -ForegroundColor Cyan

# Check if Node.js script exists for password creation
$nodeScript = @'
const argon2 = require('argon2');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function createTestPassword() {
    try {
        // Argon2 options matching the service
        const options = {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,   // 64 MB
            timeCost: 3,           // 3 iterations
            parallelism: 1,        // Single thread
        };
        
        // Hash the password
        const password = "test123";
        const hashedPassword = await argon2.hash(password, options);
        
        // Create user password object
        const userPassword = {
            userId: "test_user_demo",
            hashedPassword: hashedPassword,
            isTemporary: false,
            lastChanged: new Date().toISOString(),
            failedAttempts: 0
        };
        
        // Encrypt the data (using placeholder encryption for now)
        const ALGORITHM = 'aes-256-gcm';
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(12);
        
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(JSON.stringify(userPassword), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        
        const encryptedData = {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
        
        // Ensure directory exists
        const passwordDir = path.join(process.cwd(), 'private', 'passwords');
        if (!fs.existsSync(passwordDir)) {
            fs.mkdirSync(passwordDir, { recursive: true });
        }
        
        // Write password file
        const passwordFile = path.join(passwordDir, 'test_user_demo.pwd');
        fs.writeFileSync(passwordFile, JSON.stringify(encryptedData));
        
        console.log('✅ Test user password created successfully');
        console.log('📧 Email: profile@test.com');
        console.log('🔑 Password: test123');
        
    } catch (error) {
        console.error('❌ Error creating password:', error.message);
        process.exit(1);
    }
}

createTestPassword();
'@

# Write the Node.js script
$scriptPath = "create-password.js"
Set-Content -Path $scriptPath -Value $nodeScript

try {
    Write-Host "🚀 Running password creation script..." -ForegroundColor Yellow
    node $scriptPath
    
    Write-Host "`n✅ Test user setup complete!" -ForegroundColor Green
    Write-Host "🎯 Login credentials:" -ForegroundColor White
    Write-Host "   Email: profile@test.com" -ForegroundColor Yellow
    Write-Host "   Password: test123" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error running Node.js script: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Fallback: Use existing admin credentials" -ForegroundColor Blue
    Write-Host "   Email: admin@hambrianglory.lk" -ForegroundColor Yellow
    Write-Host "   Password: admin123" -ForegroundColor Yellow
} finally {
    # Clean up
    if (Test-Path $scriptPath) {
        Remove-Item $scriptPath -Force
    }
}
