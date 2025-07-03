import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data';

export async function GET() {
  try {
    const users = DataService.getUsers();
    console.log('Current users in DataService:', users.length);
    console.log('Users:', users.map(u => ({ id: u.id, name: u.name, email: u.email })));
    
    return NextResponse.json({ 
      users,
      count: users.length,
      message: `Found ${users.length} users in the system`
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
