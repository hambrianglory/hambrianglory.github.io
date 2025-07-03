# GitHub Pages Deployment Guide for Community Fee Management System

## 🌐 **Deploy Your Next.js App to GitHub Pages**

### **Overview**
GitHub Pages allows you to host your Community Fee Management System for free directly from your GitHub repository. Since this is a Next.js application, we'll need to configure it for static export.

---

## **Step 1: Configure Next.js for Static Export**

### **1.1 Update next.config.ts**

Your `next.config.ts` needs to be configured for static export:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/community-fee-management',
  assetPrefix: '/community-fee-management/',
}

module.exports = nextConfig
```

### **1.2 Add Build Scripts to package.json**

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "export": "next build && next export",
    "deploy": "npm run export && gh-pages -d out"
  }
}
```

---

## **Step 2: Install GitHub Pages Dependencies**

### **2.1 Install gh-pages Package**

```bash
npm install --save-dev gh-pages
```

### **2.2 Create .nojekyll File**

Create a `.nojekyll` file in your `public` folder to prevent Jekyll processing:

```bash
# This tells GitHub Pages not to use Jekyll
```

---

## **Step 3: Create GitHub Actions Workflow**

### **3.1 Create Workflow Directory**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

---

## **Step 4: Manual GitHub Pages Setup**

### **4.1 Repository Settings**

1. **Go to your repository**: https://github.com/hambrianglory/community-fee-management
2. **Click "Settings"** tab
3. **Scroll to "Pages"** section (left sidebar)

### **4.2 Configure Pages Source**

**Option A: GitHub Actions (Recommended)**
- Source: **GitHub Actions**
- This will use the workflow we created above

**Option B: Branch Deploy**
- Source: **Deploy from a branch**
- Branch: **gh-pages** (will be created automatically)
- Folder: **/ (root)**

### **4.3 Custom Domain (Optional)**

If you have a custom domain:
- Enter your domain in the "Custom domain" field
- Create a CNAME record pointing to `hambrianglory.github.io`

---

## **Step 5: Environment Variables for Production**

### **5.1 Create Production Environment File**

Create `.env.production`:

```bash
# Production Environment Variables
NEXTAUTH_URL=https://hambrianglory.github.io/community-fee-management
NEXTAUTH_SECRET=your-production-secret-key
JWT_SECRET=your-production-jwt-secret

# Note: WhatsApp API keys should be set in GitHub Secrets for security
```

### **5.2 Configure GitHub Secrets**

1. **Go to Settings → Secrets and variables → Actions**
2. **Add these secrets:**
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`

---

## **Step 6: Build and Deploy**

### **6.1 Automatic Deployment**

Once you push the workflow file, GitHub will automatically:
1. Build your Next.js application
2. Generate static files
3. Deploy to GitHub Pages
4. Provide a live URL

### **6.2 Manual Deployment**

If you prefer manual deployment:

```bash
# Build for production
npm run build

# Deploy to gh-pages branch
npm run deploy
```

---

## **Step 7: Access Your Live Site**

### **7.1 GitHub Pages URL**

Your site will be available at:
**https://hambrianglory.github.io/community-fee-management**

### **7.2 Deployment Status**

- Check deployment status in **Actions** tab
- View deployment history in **Settings → Pages**
- Monitor build logs for any issues

---

## **Step 8: Important Considerations**

### **8.1 Static Export Limitations**

Since GitHub Pages serves static files, some features may need adjustment:

**✅ What Works:**
- Frontend React components
- Static pages and routing
- CSS and styling
- Public assets and images
- Client-side JavaScript

**⚠️ What Needs Adjustment:**
- API routes (need to be moved to external service)
- Server-side authentication
- Database operations
- File uploads

### **8.2 API Routes Solution**

For full functionality, consider:

**Option 1: Vercel Deployment (Recommended)**
- Deploy to Vercel for full Next.js support
- Keep GitHub for code repository
- Use Vercel for live application

**Option 2: External API Service**
- Move API logic to separate service (Netlify Functions, AWS Lambda)
- Update frontend to call external APIs
- Keep GitHub Pages for frontend only

**Option 3: Demo Version**
- Create a demo version with mock data
- Remove server-dependent features
- Focus on UI/UX showcase

---

## **Step 9: Demo Configuration**

### **9.1 Create Demo Mode**

Add to your `next.config.ts`:

```typescript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: '/community-fee-management',
  assetPrefix: '/community-fee-management/',
  env: {
    DEMO_MODE: 'true'
  }
}
```

### **9.2 Demo Data Setup**

Create `lib/demoData.ts`:

```typescript
export const demoUsers = [
  {
    id: 1,
    name: "John Doe",
    phone: "+1234567890",
    email: "john@example.com",
    status: "paid",
    amount: 50.00
  },
  // Add more demo data
];

export const demoPayments = [
  // Demo payment data
];
```

---

## **Step 10: Troubleshooting**

### **10.1 Common Issues**

**Issue: 404 Page Not Found**
- Check `basePath` configuration
- Verify file paths in components
- Ensure `trailingSlash: true`

**Issue: Images Not Loading**
- Set `images: { unoptimized: true }`
- Use relative paths for images
- Check `assetPrefix` configuration

**Issue: API Routes Not Working**
- API routes don't work in static export
- Move to external service or create demo mode

### **10.2 Debugging Steps**

```bash
# Test local build
npm run build
npm run start

# Check generated files
ls -la out/

# Validate static export
npx serve out
```

---

## **Quick Deployment Checklist**

### **✅ Pre-Deployment:**
- [ ] Update `next.config.ts` for static export
- [ ] Add `.nojekyll` to public folder
- [ ] Create GitHub Actions workflow
- [ ] Set up environment variables
- [ ] Test local build

### **✅ Deployment:**
- [ ] Push changes to GitHub
- [ ] Enable GitHub Pages in settings
- [ ] Wait for Actions to complete
- [ ] Verify live URL works

### **✅ Post-Deployment:**
- [ ] Test all pages and components
- [ ] Verify responsive design
- [ ] Check console for errors
- [ ] Update repository description

---

**🎉 Your Community Fee Management System will be live on GitHub Pages!**

**Live URL:** https://hambrianglory.github.io/community-fee-management

This setup will create a professional demo of your application that anyone can access and explore!
