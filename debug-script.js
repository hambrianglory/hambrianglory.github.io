/**
 * Browser Debug Script for Community Fee Management System
 * 
 * Copy and paste this into your browser's developer console when you're on the deployed site
 * to diagnose database and functionality issues.
 */

async function debugCommunityFeeManagement() {
  console.log('=== Community Fee Management Debug Script ===');
  
  try {
    // Check if we're on the right site
    if (!window.location.href.includes('github.io') && !window.location.href.includes('localhost')) {
      console.warn('This script is designed for the deployed GitHub Pages site or localhost');
    }
    
    // Check localStorage
    console.log('1. Checking localStorage...');
    const storageKeys = Object.keys(localStorage);
    console.log('LocalStorage keys:', storageKeys);
    
    const encryptedData = localStorage.getItem('cfms_encrypted_data');
    console.log('Encrypted data exists:', !!encryptedData);
    console.log('Encrypted data length:', encryptedData?.length || 0);
    
    // Check if the page has loaded properly
    console.log('2. Checking page elements...');
    const hasAdminDashboard = document.querySelector('h1')?.textContent?.includes('Admin Dashboard');
    const hasLoginForm = document.querySelector('form') && document.querySelector('input[type="email"]');
    console.log('Has admin dashboard:', hasAdminDashboard);
    console.log('Has login form:', hasLoginForm);
    
    // Check if global objects exist
    console.log('3. Checking global objects...');
    console.log('CryptoJS available:', typeof CryptoJS !== 'undefined');
    console.log('Next.js router available:', typeof window.next !== 'undefined');
    
    // Try to access the database if we can
    console.log('4. Attempting database access...');
    
    // Check for any JavaScript errors
    console.log('5. Checking for JavaScript errors...');
    window.addEventListener('error', (e) => {
      console.error('JavaScript Error:', e.error);
    });
    
    // Check network requests
    console.log('6. Monitoring network requests...');
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      console.log('Fetch request:', args[0]);
      const response = await originalFetch(...args);
      console.log('Fetch response:', response.status, response.statusText);
      return response;
    };
    
    console.log('Debug script loaded successfully!');
    console.log('Now try to reproduce the issue and watch the console output.');
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

// Auto-run the debug script
debugCommunityFeeManagement();

// Also make it available globally
window.debugCommunityFeeManagement = debugCommunityFeeManagement;

console.log('%c🔍 Debug script loaded! Use debugCommunityFeeManagement() to run again.', 'color: #2563eb; font-weight: bold;');
