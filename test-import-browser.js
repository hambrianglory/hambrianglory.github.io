const fs = require('fs');

// Simple test to simulate the upload
async function testDirectImport() {
  try {
    console.log('Testing direct import simulation...');
    
    // Simulate CSV data parsing
    const csvData = [
      {
        name: 'Test User 1',
        email: 'test1@example.com',
        phone: '0771234567',
        houseNumber: 'T1',
        amount: '5000',
        status: 'paid'
      },
      {
        name: 'Test User 2',
        email: 'test2@example.com',
        phone: '0779876543',
        houseNumber: 'T2',
        amount: '3000',
        status: 'pending'
      }
    ];
    
    // Make API call to upload endpoint
    const formData = new FormData();
    
    // Create a blob with CSV content
    const csvContent = 'name,email,phone,houseNumber,amount,status\n' +
      csvData.map(row => `${row.name},${row.email},${row.phone},${row.houseNumber},${row.amount},${row.status}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'test-users.csv', { type: 'text/csv' });
    
    formData.append('file', file);
    formData.append('type', 'users');
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('Upload response status:', response.status);
    console.log('Upload response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Import successful!');
      
      // Test fetching users to see if they were added
      console.log('\nFetching users to verify import...');
      const usersResponse = await fetch('http://localhost:3000/api/users');
      const usersResult = await usersResponse.json();
      
      console.log('Users response status:', usersResponse.status);
      console.log('Total users:', usersResult.users ? usersResult.users.length : 'unknown');
      
      if (usersResult.users) {
        const importedUsers = usersResult.users.filter(u => u.email.includes('test'));
        console.log('Imported test users found:', importedUsers.length);
        importedUsers.forEach(user => {
          console.log(`- ${user.name} (${user.email})`);
        });
      }
    } else {
      console.log('❌ Import failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Check if we're in browser environment
if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
  testDirectImport();
} else {
  console.log('This script needs to run in a browser environment with fetch API');
  console.log('Please open the browser console and run this script there.');
}
