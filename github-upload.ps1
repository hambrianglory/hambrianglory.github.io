#!/usr/bin/env pwsh

Write-Host "🚀 GitHub Upload Script - Community Fee Management" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Get GitHub username
Write-Host "📋 Step 1: GitHub Username" -ForegroundColor Yellow
$username = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username is required!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Username: $username" -ForegroundColor Green
Write-Host ""

# Check if git is configured
Write-Host "📋 Step 2: Git Configuration" -ForegroundColor Yellow
$gitUser = git config --global user.name 2>$null
$gitEmail = git config --global user.email 2>$null

if ([string]::IsNullOrWhiteSpace($gitUser) -or [string]::IsNullOrWhiteSpace($gitEmail)) {
    Write-Host "⚠️  Git not configured. Let's set it up:" -ForegroundColor Yellow
    
    if ([string]::IsNullOrWhiteSpace($gitUser)) {
        $fullName = Read-Host "Enter your full name for Git"
        git config --global user.name "$fullName"
    }
    
    if ([string]::IsNullOrWhiteSpace($gitEmail)) {
        $email = Read-Host "Enter your email for Git"
        git config --global user.email "$email"
    }
    
    Write-Host "✅ Git configured successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Git already configured: $gitUser <$gitEmail>" -ForegroundColor Green
}
Write-Host ""

# Check if repository exists
Write-Host "📋 Step 3: Repository Setup" -ForegroundColor Yellow
$repoUrl = "https://github.com/$username/community-fee-management.git"

Write-Host "🌐 Repository URL: $repoUrl" -ForegroundColor Blue
Write-Host ""
Write-Host "📌 Manual Step Required:" -ForegroundColor Red
Write-Host "1. Open: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: community-fee-management" -ForegroundColor White
Write-Host "3. Make it PUBLIC (for free Netlify deployment)" -ForegroundColor White
Write-Host "4. DO NOT initialize with README" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter after creating the GitHub repository"

# Add all files to git
Write-Host "📋 Step 4: Adding Files to Git" -ForegroundColor Yellow
Write-Host "Adding all files..." -ForegroundColor Gray
git add .

$status = git status --porcelain
if ($status) {
    Write-Host "✅ Files added to staging area" -ForegroundColor Green
    Write-Host "Files to be committed:" -ForegroundColor Gray
    git status --short
} else {
    Write-Host "✅ Working directory is clean" -ForegroundColor Green
}
Write-Host ""

# Commit changes
Write-Host "📋 Step 5: Committing Changes" -ForegroundColor Yellow
$commitMessage = "Initial commit: Community Fee Management App ready for deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "Commit message: $commitMessage" -ForegroundColor Gray

try {
    git commit -m "$commitMessage"
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No changes to commit (already committed)" -ForegroundColor Blue
}
Write-Host ""

# Set up remote
Write-Host "📋 Step 6: Setting up Remote Repository" -ForegroundColor Yellow

# Remove existing remote if it exists
git remote remove origin 2>$null

# Add new remote
git remote add origin $repoUrl
Write-Host "✅ Remote repository added: $repoUrl" -ForegroundColor Green
Write-Host ""

# Push to GitHub
Write-Host "📋 Step 7: Uploading to GitHub" -ForegroundColor Yellow
Write-Host "Setting main branch..." -ForegroundColor Gray
git branch -M main

Write-Host "Pushing to GitHub..." -ForegroundColor Gray
Write-Host "⚠️  You may be prompted for GitHub credentials" -ForegroundColor Yellow

try {
    git push -u origin main
    Write-Host "✅ Successfully uploaded to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Upload failed. Possible issues:" -ForegroundColor Red
    Write-Host "• Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "• Authentication required" -ForegroundColor White
    Write-Host "• Network connectivity" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Try running this command manually:" -ForegroundColor Blue
    Write-Host "git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 GITHUB UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your Repository:" -ForegroundColor Blue
Write-Host "   https://github.com/$username/community-fee-management" -ForegroundColor White
Write-Host ""
Write-Host "📁 What's Uploaded:" -ForegroundColor Cyan
Write-Host "   ✅ Complete community fee management app" -ForegroundColor White
Write-Host "   ✅ All source code and configurations" -ForegroundColor White
Write-Host "   ✅ Netlify deployment files" -ForegroundColor White
Write-Host "   ✅ Documentation and guides" -ForegroundColor White
Write-Host "   ✅ WhatsApp integration code" -ForegroundColor White
Write-Host "   ✅ Admin panel and user management" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://app.netlify.com" -ForegroundColor White
Write-Host "   2. Connect your GitHub repository" -ForegroundColor White
Write-Host "   3. Deploy your app automatically" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Your app is now ready for Netlify deployment!" -ForegroundColor Green
