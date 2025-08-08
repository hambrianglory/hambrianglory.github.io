// Simple test to check upload API response
async function testUploadAPI() {
  console.log('🧪 Testing Upload API...');
  
  // Create test CSV content
  const csvContent = `name,email,phone,houseNumber,amount,status
Test User 1,test1@example.com,0771234567,T1,5000,paid
Test User 2,test2@example.com,0779876543,T2,3000,pending`;

  // Create FormData
  const formData = new FormData();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const file = new File([blob], 'test-users.csv', { type: 'text/csv' });
  
  formData.append('file', file);
  formData.append('type', 'users');

  try {
    console.log('📤 Sending upload request...');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Status Text:', response.statusText);
    
    const result = await response.json();
    console.log('📋 Response Data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Upload successful!');
      
      // Test if users were actually imported
      console.log('\n🔍 Checking if users were imported...');
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      
      console.log('👥 Users API Status:', usersResponse.status);
      console.log('👥 Total Users:', usersData.users ? usersData.users.length : 'unknown');
      
      if (usersData.users) {
        const testUsers = usersData.users.filter(u => u.email.includes('test'));
        console.log('🎯 Test Users Found:', testUsers.length);
        testUsers.forEach(user => console.log(`   - ${user.name} (${user.email})`));
      }
    } else {
      console.log('❌ Upload failed!');
      console.log('Error:', result.error || 'Unknown error');
    }
  } catch (error) {
    console.log('💥 Network Error:', error);
  }
}

// Auto-run the test
testUploadAPI();
