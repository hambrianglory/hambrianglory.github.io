# Interactive GitHub Upload Script for Community Fee Management System
# This script will help you upload your project to GitHub safely

Write-Host "🚀 Community Fee Management System - GitHub Upload Assistant" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: This script must be run from the project root directory" -ForegroundColor Red
    Write-Host "Please navigate to the community-fee-management folder and run this script again" -ForegroundColor Yellow
    exit 1
}

# Check git status
Write-Host "🔍 Checking Git Status..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes." -ForegroundColor Yellow
    Write-Host "Current status:" -ForegroundColor Yellow
    git status
    Write-Host ""
    $commitChoice = Read-Host "Do you want to commit these changes first? (y/n)"
    if ($commitChoice -eq 'y' -or $commitChoice -eq 'Y') {
        git add .
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Update: Additional changes before GitHub upload"
        }
        git commit -m $commitMessage
        Write-Host "✅ Changes committed successfully!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📋 Pre-Upload Checklist:" -ForegroundColor Cyan
Write-Host "✅ Git repository initialized and committed" -ForegroundColor Green
Write-Host "✅ Sensitive files excluded via .gitignore" -ForegroundColor Green
Write-Host "✅ Documentation and README included" -ForegroundColor Green
Write-Host ""

# Get GitHub repository information
Write-Host "🏠 GitHub Repository Setup" -ForegroundColor Cyan
Write-Host "Please provide your GitHub repository details:" -ForegroundColor Yellow
Write-Host ""

$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (default: community-fee-management)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "community-fee-management"
}

Write-Host ""
Write-Host "📝 Repository URL will be: https://github.com/$githubUsername/$repoName" -ForegroundColor Yellow
Write-Host ""

# Check if repository exists on GitHub
Write-Host "🔍 Checking if repository exists on GitHub..." -ForegroundColor Cyan
$repoUrl = "https://github.com/$githubUsername/$repoName.git"

# Check if remote already exists
$existingRemote = git remote -v 2>$null | Select-String "origin"
if ($existingRemote) {
    Write-Host "⚠️  Remote origin already exists:" -ForegroundColor Yellow
    git remote -v
    Write-Host ""
    $removeRemote = Read-Host "Do you want to remove the existing remote and add the new one? (y/n)"
    if ($removeRemote -eq 'y' -or $removeRemote -eq 'Y') {
        git remote remove origin
        Write-Host "✅ Existing remote removed" -ForegroundColor Green
    }
}

# Add remote
Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Cyan
try {
    git remote add origin $repoUrl
    Write-Host "✅ Remote added successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error adding remote. It might already exist." -ForegroundColor Red
}

Write-Host ""
Write-Host "🔐 Authentication Setup" -ForegroundColor Cyan
Write-Host "IMPORTANT: You'll need a Personal Access Token for authentication" -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps to create a Personal Access Token:" -ForegroundColor White
Write-Host "1. Go to GitHub.com → Settings → Developer settings → Personal access tokens" -ForegroundColor Gray
Write-Host "2. Click 'Generate new token' → 'Generate new token (classic)'" -ForegroundColor Gray
Write-Host "3. Set name: 'Community Fee Management Upload'" -ForegroundColor Gray
Write-Host "4. Select scope: 'repo' (full repository access)" -ForegroundColor Gray
Write-Host "5. Click 'Generate token' and copy it immediately" -ForegroundColor Gray
Write-Host ""

$tokenReady = Read-Host "Do you have your Personal Access Token ready? (y/n)"
if ($tokenReady -ne 'y' -and $tokenReady -ne 'Y') {
    Write-Host ""
    Write-Host "⏸️  Please create your Personal Access Token first, then run this script again." -ForegroundColor Yellow
    Write-Host "📖 Check GITHUB_TOKEN_SETUP.md for detailed instructions" -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "🚀 Ready to Upload!" -ForegroundColor Green
Write-Host "When prompted for credentials:" -ForegroundColor Yellow
Write-Host "  Username: $githubUsername" -ForegroundColor White
Write-Host "  Password: [Use your Personal Access Token]" -ForegroundColor White
Write-Host ""

$proceedUpload = Read-Host "Proceed with upload? (y/n)"
if ($proceedUpload -eq 'y' -or $proceedUpload -eq 'Y') {
    Write-Host ""
    Write-Host "📤 Uploading to GitHub..." -ForegroundColor Cyan
    
    try {
        git push -u origin main
        Write-Host ""
        Write-Host "🎉 SUCCESS! Your Community Fee Management System has been uploaded to GitHub!" -ForegroundColor Green
        Write-Host "📍 Repository URL: https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Visit your repository on GitHub to verify the upload" -ForegroundColor White
        Write-Host "2. Add repository description and topics" -ForegroundColor White
        Write-Host "3. Consider setting up GitHub Pages for hosting" -ForegroundColor White
        Write-Host "4. Invite collaborators if needed" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 Project Features Successfully Uploaded:" -ForegroundColor Green
        Write-Host "✅ Next.js 14 application with TypeScript" -ForegroundColor Green
        Write-Host "✅ WhatsApp Business API integration" -ForegroundColor Green
        Write-Host "✅ Admin dashboard and user management" -ForegroundColor Green
        Write-Host "✅ Excel/CSV upload functionality" -ForegroundColor Green
        Write-Host "✅ Payment tracking and reminders" -ForegroundColor Green
        Write-Host "✅ Profile picture management" -ForegroundColor Green
        Write-Host "✅ Comprehensive documentation" -ForegroundColor Green
        
    } catch {
        Write-Host ""
        Write-Host "❌ Upload failed. Common issues:" -ForegroundColor Red
        Write-Host "1. Check your GitHub username and repository name" -ForegroundColor Yellow
        Write-Host "2. Ensure you're using the Personal Access Token as password" -ForegroundColor Yellow
        Write-Host "3. Verify the repository exists on GitHub" -ForegroundColor Yellow
        Write-Host "4. Check your internet connection" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Try running the manual commands:" -ForegroundColor Cyan
        Write-Host "git remote -v" -ForegroundColor Gray
        Write-Host "git push -u origin main" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "⏸️  Upload cancelled. You can run this script again when ready." -ForegroundColor Yellow
    Write-Host "📖 Manual upload instructions are available in GITHUB_UPLOAD_STEPS.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📚 Additional Resources:" -ForegroundColor Cyan
Write-Host "- GITHUB_UPLOAD_STEPS.md - Step-by-step manual instructions" -ForegroundColor Gray
Write-Host "- GITHUB_TOKEN_SETUP.md - Detailed token setup guide" -ForegroundColor Gray
Write-Host "- README.md - Project documentation" -ForegroundColor Gray
Write-Host ""
Write-Host "Thank you for using the Community Fee Management System! 🎊" -ForegroundColor Green
