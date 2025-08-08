import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Import server storage
    const { ServerUserStorage } = require('@/lib/serverUserStorage');
    
    const importedUsers = ServerUserStorage.getImportedUsers();
    
    return NextResponse.json({
      success: true,
      importedUsersCount: importedUsers.length,
      importedUsers: importedUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        houseNumber: user.houseNumber
      }))
    });
    
  } catch (error) {
    console.error('Debug server storage error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to read server storage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
