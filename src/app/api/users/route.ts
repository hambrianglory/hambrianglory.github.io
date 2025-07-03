import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data';

export async function GET() {
  try {
    let users = DataService.getUsers();
    
    // Initialize sample data if no users exist
    if (users.length === 0) {
      DataService.initializeSampleData();
      users = DataService.getUsers();
    }
    
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    await DataService.addUser(userData);
    return NextResponse.json({ message: 'User added successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = DataService.updateUser(id, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const success = DataService.deleteUser(id);
    
    if (!success) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
