// Simple test script to verify database functionality
import { localDB } from './src/lib/localDatabase';

async function testDatabase() {
  console.log('=== DATABASE TEST ===');
  
  try {
    // Test initialization
    console.log('1. Testing database initialization...');
    await localDB.initializeDatabase();
    
    // Test health check
    console.log('2. Testing health check...');
    const health = await localDB.checkDatabaseHealth();
    console.log('Health check result:', health);
    
    // Test basic operations
    console.log('3. Testing basic operations...');
    const users = await localDB.getAllUsers();
    console.log('Users count:', users.length);
    
    const payments = await localDB.getAllPayments();
    console.log('Payments count:', payments.length);
    
    const loginHistory = await localDB.getLoginHistory();
    console.log('Login history count:', loginHistory.length);
    
    const stats = await localDB.getStats();
    console.log('Stats:', stats);
    
    // Test CSV parsing
    console.log('4. Testing CSV parsing...');
    const sampleCSV = 'name,email,phone\nJohn Doe,john@test.com,123456789\nJane Smith,jane@test.com,987654321';
    const parsedData = await localDB.parseCSV(sampleCSV);
    console.log('Parsed CSV data:', parsedData);
    
    console.log('=== ALL TESTS PASSED ===');
    
  } catch (error) {
    console.error('=== TEST FAILED ===');
    console.error(error);
  }
}

// Export for browser testing
if (typeof window !== 'undefined') {
  (window as any).testDatabase = testDatabase;
}

export default testDatabase;
