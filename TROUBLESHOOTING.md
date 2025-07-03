# Community Fee Management System - Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to upload file" Error

**Symptoms:**
- File upload fails with error message
- CSV import doesn't work
- Alert shows "Failed to process file"

**Solutions:**

1. **Check file format:**
   - Ensure the file is a `.csv` file
   - File should have proper headers
   - Use the provided templates

2. **Check file content:**
   - File should not be empty
   - Should have at least 2 rows (header + data)
   - No special characters in headers

3. **Try the debug button:**
   - Click "Debug DB" in the admin dashboard
   - Check the console for detailed error messages
   - Look for database initialization issues

4. **Manual CSV template:**
   ```csv
   name,email,phone,nicNumber,address,role,amount,status
   John Doe,john@example.com,+1234567890,123456789V,123 Street,member,150.00,paid
   ```

### 2. "Failed to load login history" Error

**Symptoms:**
- Login history tab shows empty or errors
- "Failed to load login history" alert

**Solutions:**

1. **Clear browser data:**
   - Clear localStorage for the site
   - Refresh the page to reinitialize database

2. **Check browser console:**
   - Look for encryption/decryption errors
   - Check if localStorage is working

3. **Try incognito/private mode:**
   - Test if the issue is browser-specific
   - Check if extensions are interfering

### 3. "Failed to load account information" Error

**Symptoms:**
- Admin dashboard doesn't load member data
- Statistics show 0 for everything
- Database appears empty

**Solutions:**

1. **Database reinitialization:**
   - Click "Debug DB" button
   - If database is empty, refresh the page
   - The system should auto-create sample data

2. **Check browser compatibility:**
   - Ensure localStorage is enabled
   - Try in different browsers (Chrome, Firefox, Safari)

3. **Clear site data:**
   - Go to browser settings
   - Clear site data for the GitHub Pages domain
   - Reload the page

### 4. Network/API Errors

**Symptoms:**
- Network errors in console
- API calls failing
- 404 errors

**Solutions:**

1. **This is expected for GitHub Pages:**
   - The system is designed to work without APIs
   - All data is stored locally in browser
   - No server-side functionality needed

2. **Check URL:**
   - Ensure you're on the correct GitHub Pages URL
   - URL should be: `https://yourusername.github.io/community-fee-management/`

### 5. Login Issues

**Symptoms:**
- Cannot login to admin dashboard
- Login form doesn't work
- Authentication fails

**Solutions:**

1. **Use default credentials:**
   - Email: `admin@hambriangLory.com`
   - Password: `Admin@2025`

2. **Check browser console:**
   - Look for database initialization errors
   - Check if encryption is working

3. **Clear browser storage:**
   - Clear localStorage
   - Refresh page to reinitialize

## Debug Steps

### Step 1: Open Browser Console
1. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. Go to the "Console" tab
3. Look for error messages

### Step 2: Check Database Status
1. Login to admin dashboard
2. Click "Debug DB" button
3. Check the alert message and console output

### Step 3: Manual Database Test
Copy and paste this into the browser console:

```javascript
// Test database functionality
(async () => {
  try {
    console.log('Testing database...');
    
    // Check localStorage
    const data = localStorage.getItem('cfms_encrypted_data');
    console.log('Storage data exists:', !!data);
    
    // Test if we can create a test entry
    localStorage.setItem('test', 'working');
    const test = localStorage.getItem('test');
    console.log('LocalStorage working:', test === 'working');
    localStorage.removeItem('test');
    
    console.log('Database test complete');
  } catch (error) {
    console.error('Database test failed:', error);
  }
})();
```

### Step 4: Check Network Tab
1. Go to "Network" tab in developer tools
2. Reload the page
3. Look for failed requests (should be minimal for static site)

### Step 5: Test in Incognito Mode
1. Open incognito/private browsing window
2. Navigate to the site
3. Test the same functionality

## File Format Requirements

### Users CSV Format:
```csv
name,email,phone,nicNumber,address,role,amount,status
John Doe,john@example.com,+1234567890,123456789V,123 Street,member,150.00,paid
Jane Smith,jane@example.com,+1234567891,987654321V,456 Avenue,member,150.00,pending
```

### Payments CSV Format:
```csv
email,amount,date,status,method,reference
john@example.com,150.00,2025-01-15,paid,bank,TXN123
jane@example.com,150.00,2025-01-20,pending,cash,CASH456
```

## Still Having Issues?

1. **Check browser compatibility:**
   - Use modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
   - Ensure JavaScript is enabled
   - Disable browser extensions that might interfere

2. **Check site URL:**
   - Ensure you're on the correct GitHub Pages URL
   - Check for typos in the URL

3. **Try clearing everything:**
   - Clear all browser data for the site
   - Reload the page
   - Try the debug steps again

4. **Check GitHub Pages deployment:**
   - Ensure the site is properly deployed
   - Check the GitHub Actions tab for deployment status

## Contact Information

If you continue to experience issues, please:
1. Run the debug script and copy the console output
2. Note your browser type and version
3. Describe the exact steps that cause the error
4. Include any error messages you see

The system is designed to work entirely in the browser with no server dependencies, so most issues are related to browser storage or JavaScript execution.
