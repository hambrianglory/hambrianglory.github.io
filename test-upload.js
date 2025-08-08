// Simple test script to test the upload API
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testUpload() {
  try {
    console.log('Testing upload API...');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-users.csv'));
    formData.append('type', 'users');
    
    // Make the request
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Upload successful!');
    } else {
      console.log('❌ Upload failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpload();
