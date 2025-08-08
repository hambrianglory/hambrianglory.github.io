// Test password change functionality
async function testPasswordChange() {
  console.log('🔐 Testing Password Change Functionality');
  
  // Test 1: Change password with correct old password
  console.log('\n--- Test 1: Change password with correct credentials ---');
  const changePasswordData = {
    email: 'admin@hambriangLory.com',
    oldPassword: 'Admin@2025',
    newPassword: 'NewSecurePassword123!',
    isChangePassword: true
  };

  try {
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changePasswordData)
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Password change successful!');
      
      // Test 2: Login with new password
      console.log('\n--- Test 2: Login with new password ---');
      const loginData = {
        email: 'admin@hambriangLory.com',
        password: 'NewSecurePassword123!'
      };

      const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const loginResult = await loginResponse.json();
      
      console.log('Login response status:', loginResponse.status);
      console.log('Login response data:', loginResult);
      
      if (loginResponse.ok) {
        console.log('✅ Login with new password successful!');
        
        // Test 3: Change password back to original
        console.log('\n--- Test 3: Change password back to original ---');
        const revertPasswordData = {
          email: 'admin@hambriangLory.com',
          oldPassword: 'NewSecurePassword123!',
          newPassword: 'Admin@2025',
          isChangePassword: true
        };

        const revertResponse = await fetch('http://localhost:3002/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(revertPasswordData)
        });

        const revertResult = await revertResponse.json();
        
        console.log('Revert response status:', revertResponse.status);
        console.log('Revert response data:', revertResult);
        
        if (revertResponse.ok) {
          console.log('✅ Password reverted successfully!');
        } else {
          console.log('❌ Failed to revert password');
        }
      } else {
        console.log('❌ Login with new password failed');
      }
    } else {
      console.log('❌ Password change failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

// Test with wrong old password
async function testWrongOldPassword() {
  console.log('\n--- Test 4: Change password with wrong old password ---');
  const wrongPasswordData = {
    email: 'admin@hambriangLory.com',
    oldPassword: 'WrongPassword123',
    newPassword: 'NewSecurePassword123!',
    isChangePassword: true
  };

  try {
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wrongPasswordData)
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected wrong old password');
    } else {
      console.log('❌ Should have rejected wrong old password');
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

// Run tests
testPasswordChange().then(() => testWrongOldPassword());
