// Test login API
async function testLogin() {
  const loginData = {
    email: 'admin@hambriangLory.com',
    password: 'Admin@2025'
  };

  try {
    console.log('Testing login with:', loginData.email);
    
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user);
      console.log('Token received:', !!data.token);
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

// Also test with wrong credentials
async function testWrongLogin() {
  const loginData = {
    email: 'admin@hambriangLory.com',
    password: 'wrongpassword'
  };

  try {
    console.log('\n--- Testing with wrong password ---');
    console.log('Testing login with:', loginData.email);
    
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected wrong password');
    } else {
      console.log('❌ Unexpected response for wrong password');
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

console.log('🔐 Testing Community Fee Management Login API');
testLogin().then(() => testWrongLogin());
