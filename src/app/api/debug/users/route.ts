import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/localDatabase';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const users = await localDB.getAllUsers();
    
    // Return debug info about users (without full passwords for security)
    const debugInfo = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      nicNumber: user.nicNumber,
      isActive: user.isActive,
      passwordSet: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStartsWith: user.password ? user.password.substring(0, 3) + '...' : 'none',
      createdAt: user.createdAt
    }));

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: debugInfo
    });

  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
