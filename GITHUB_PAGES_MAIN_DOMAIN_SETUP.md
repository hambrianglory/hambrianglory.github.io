# Setup Instructions: Move to Main GitHub Pages Domain

## Goal: Make your app load at https://hambrianglory.github.io/

### Step 1: Create Main GitHub Pages Repository

1. Go to GitHub.com and create a **new repository**
2. **Repository name MUST be**: `hambrianglory.github.io` (exactly this name)
3. Make it **Public**
4. Don't initialize with README (we'll push existing code)

### Step 2: Update Repository Configuration

After creating the new repository, run these commands:

```bash
# Add new remote for main GitHub Pages
git remote add pages https://github.com/hambrianglory/hambrianglory.github.io.git

# Push to main GitHub Pages repository
git push pages main

# Or if you want to switch completely:
git remote set-url origin https://github.com/hambrianglory/hambrianglory.github.io.git
git push origin main
```

### Step 3: Update GitHub Pages Settings

1. Go to your new repository: https://github.com/hambrianglory/hambrianglory.github.io
2. Go to Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "main" 
5. Folder: "/ (root)"

### Step 4: Update Build Configuration

The app is already configured for static export, so it will work perfectly.

### Result

Your app will be available at: **https://hambrianglory.github.io/**

---

## Alternative: Use GitHub Actions for Better Deployment

I can also set up GitHub Actions to automatically deploy to the main domain with better optimization.

Would you like me to:
1. Help you create the hambrianglory.github.io repository setup, OR
2. Set up advanced GitHub Actions deployment?
