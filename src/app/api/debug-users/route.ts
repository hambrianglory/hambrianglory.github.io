import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/localDatabase';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG GET USERS ===');
    
    // Test getting users from localDB
    console.log('Getting users from localDB...');
    const users = await localDB.getAllUsers();
    console.log('LocalDB users count:', users.length);
    console.log('LocalDB users:', users.map(u => ({ name: u.name, email: u.email })));
    
    // Test getting users from server storage directly
    console.log('Getting users from server storage directly...');
    try {
      const { ServerUserStorage } = require('@/lib/serverUserStorage');
      const importedUsers = ServerUserStorage.getImportedUsers();
      console.log('Server storage users count:', importedUsers.length);
      console.log('Server storage users:', importedUsers.map((u: any) => ({ name: u.name, email: u.email })));
    } catch (storageError) {
      console.log('Server storage error:', storageError);
    }
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      success: true,
      users: usersWithoutPasswords,
      debug: {
        totalUsers: users.length,
        localDBUsersCount: users.length
      }
    });

  } catch (error) {
    console.error('Debug get users error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
