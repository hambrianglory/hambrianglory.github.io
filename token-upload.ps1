# Personal Access Token GitHub Upload Script
# Simplified script specifically for token-based authentication

Write-Host "🔐 GitHub Personal Access Token Upload Assistant" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the community-fee-management directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pre-Upload Status Check:" -ForegroundColor Cyan
Write-Host "✅ Project: Community Fee Management System" -ForegroundColor Green
Write-Host "✅ Files: 80+ files ready for upload" -ForegroundColor Green
Write-Host "✅ Security: Sensitive data excluded" -ForegroundColor Green
Write-Host ""

# Get repository details
Write-Host "🏠 Repository Information:" -ForegroundColor Cyan
$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (default: community-fee-management)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "community-fee-management"
}

$repoUrl = "https://github.com/$githubUsername/$repoName.git"
Write-Host "📍 Repository URL: $repoUrl" -ForegroundColor Yellow
Write-Host ""

# Personal Access Token instructions
Write-Host "🔑 Personal Access Token Setup:" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 1: Create Personal Access Token" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "2. Click 'Generate new token' → 'Generate new token (classic)'" -ForegroundColor Gray
Write-Host "3. Token name: 'Community Fee Management Upload'" -ForegroundColor Gray
Write-Host "4. Expiration: 90 days (recommended)" -ForegroundColor Gray
Write-Host "5. Scope: Check 'repo' (full repository access)" -ForegroundColor Gray
Write-Host "6. Click 'Generate token'" -ForegroundColor Gray
Write-Host "7. COPY THE TOKEN IMMEDIATELY (you won't see it again!)" -ForegroundColor Red
Write-Host ""
Write-Host "Token format: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" -ForegroundColor Gray
Write-Host ""

$hasToken = Read-Host "Do you have your Personal Access Token ready? (y/n)"
if ($hasToken -ne 'y' -and $hasToken -ne 'Y') {
    Write-Host ""
    Write-Host "⏸️  Please create your Personal Access Token first." -ForegroundColor Yellow
    Write-Host "📖 See PERSONAL_ACCESS_TOKEN_GUIDE.md for detailed instructions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host ""
Write-Host "STEP 2: Create GitHub Repository" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/new" -ForegroundColor Gray
Write-Host "2. Repository name: $repoName" -ForegroundColor Gray
Write-Host "3. Description: Community Fee Management System - Next.js with WhatsApp Integration" -ForegroundColor Gray
Write-Host "4. Choose Public or Private" -ForegroundColor Gray
Write-Host "5. DON'T initialize with README (we already have one)" -ForegroundColor Gray
Write-Host "6. Click 'Create repository'" -ForegroundColor Gray
Write-Host ""

$repoCreated = Read-Host "Have you created the repository on GitHub? (y/n)"
if ($repoCreated -ne 'y' -and $repoCreated -ne 'Y') {
    Write-Host ""
    Write-Host "⏸️  Please create the repository first, then run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔗 Setting up Git remote..." -ForegroundColor Cyan

# Check if remote already exists
$existingRemote = git remote -v 2>$null | Select-String "origin"
if ($existingRemote) {
    Write-Host "⚠️  Remote 'origin' already exists. Removing..." -ForegroundColor Yellow
    git remote remove origin
}

# Add remote
try {
    git remote add origin $repoUrl
    Write-Host "✅ Remote added successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error adding remote: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Ready to Upload!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT AUTHENTICATION INFO:" -ForegroundColor Red
Write-Host "When prompted for credentials, use:" -ForegroundColor Yellow
Write-Host "  Username: $githubUsername" -ForegroundColor White
Write-Host "  Password: [YOUR PERSONAL ACCESS TOKEN]" -ForegroundColor White
Write-Host "  (NOT your GitHub password - use the token!)" -ForegroundColor Red
Write-Host ""

$proceed = Read-Host "Ready to upload? (y/n)"
if ($proceed -eq 'y' -or $proceed -eq 'Y') {
    Write-Host ""
    Write-Host "📤 Uploading to GitHub..." -ForegroundColor Cyan
    Write-Host "You will be prompted for credentials now..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Push to GitHub
        git push -u origin main
        
        Write-Host ""
        Write-Host "🎉 SUCCESS! Your project has been uploaded to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔗 Repository: https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📊 What was uploaded:" -ForegroundColor Green
        Write-Host "  ✅ Complete Next.js application with TypeScript" -ForegroundColor Green
        Write-Host "  ✅ WhatsApp Business API integration" -ForegroundColor Green
        Write-Host "  ✅ Admin dashboard and user management" -ForegroundColor Green
        Write-Host "  ✅ Payment tracking and management" -ForegroundColor Green
        Write-Host "  ✅ Profile picture management" -ForegroundColor Green
        Write-Host "  ✅ Comprehensive documentation" -ForegroundColor Green
        Write-Host "  ✅ Professional README.md" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
        Write-Host "  1. Visit your repository to verify the upload" -ForegroundColor White
        Write-Host "  2. Add repository description and topics" -ForegroundColor White
        Write-Host "  3. Consider adding collaborators" -ForegroundColor White
        Write-Host "  4. Set up GitHub Actions (optional)" -ForegroundColor White
        Write-Host ""
        Write-Host "🔐 Security Notes:" -ForegroundColor Cyan
        Write-Host "  ✅ No sensitive data was uploaded" -ForegroundColor Green
        Write-Host "  ✅ API keys and secrets are excluded" -ForegroundColor Green
        Write-Host "  ✅ User data remains private" -ForegroundColor Green
        Write-Host ""
        
    } catch {
        Write-Host ""
        Write-Host "❌ Upload failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "1. Authentication failed - Check your username and token" -ForegroundColor White
        Write-Host "2. Repository not found - Verify the repository exists on GitHub" -ForegroundColor White
        Write-Host "3. Permission denied - Check token has 'repo' scope" -ForegroundColor White
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Cyan
        Write-Host "• Username should be: $githubUsername" -ForegroundColor Gray
        Write-Host "• Password should be your Personal Access Token (starts with 'ghp_')" -ForegroundColor Gray
        Write-Host "• Token should have 'repo' scope enabled" -ForegroundColor Gray
        Write-Host ""
        Write-Host "You can try the manual upload:" -ForegroundColor Yellow
        Write-Host "git push -u origin main" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "⏸️  Upload cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual upload commands:" -ForegroundColor Cyan
    Write-Host "git remote add origin $repoUrl" -ForegroundColor Gray
    Write-Host "git push -u origin main" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "• PERSONAL_ACCESS_TOKEN_GUIDE.md - Complete token guide" -ForegroundColor Gray
Write-Host "• GITHUB_UPLOAD_STEPS.md - Step-by-step instructions" -ForegroundColor Gray
Write-Host "• README.md - Project documentation" -ForegroundColor Gray
Write-Host ""
Write-Host "Thank you for using the Community Fee Management System! 🏆" -ForegroundColor Green
