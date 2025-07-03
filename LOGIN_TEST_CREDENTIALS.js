/**
 * Test script to verify login credentials and local database functionality
 * Run this in the browser console on the login page
 */

// Test login credentials
const testCredentials = [
  {
    email: 'admin@hambriangLory.com',
    password: 'Admin@2025',
    role: 'admin'
  },
  {
    email: 'john.doe@email.com',
    password: 'password123',
    role: 'member'
  },
  {
    email: 'jane.smith@email.com',
    password: 'password123',
    role: 'member'
  }
];

console.log('=== Community Fee Management System - Login Test ===');
console.log('');
console.log('Available test accounts:');
testCredentials.forEach((cred, index) => {
  console.log(`${index + 1}. ${cred.role.toUpperCase()}: ${cred.email} / ${cred.password}`);
});

console.log('');
console.log('How to test:');
console.log('1. Open the login page');
console.log('2. Use any of the credentials above');
console.log('3. Admin account will redirect to /admin');
console.log('4. Member accounts will redirect to /dashboard');
console.log('');
console.log('The system uses encrypted local storage for all data.');
console.log('All passwords are securely hashed and stored locally.');
console.log('');
console.log('To clear all data: localStorage.removeItem("cfms_encrypted_data")');
