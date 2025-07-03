import { NextRequest, NextResponse } from 'next/server';
import { PasswordService } from '@/lib/passwordService';
import { DataService } from '@/lib/data';
import jwt from 'jsonwebtoken';

// Verify admin token
function verifyAdminToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Get users with account issues
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Get users with account issues
    const usersWithIssues = PasswordService.getUsersWithAccountIssues();
    
    // Enhance with user details
    const enhancedUsers = usersWithIssues.map(userIssue => {
      const user = DataService.getUserById(userIssue.userId);
      return {
        ...userIssue,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      users: enhancedUsers,
      totalCount: enhancedUsers.length
    });

  } catch (error) {
    console.error('Error getting account issues:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve account information' },
      { status: 500 }
    );
  }
}

// POST - Perform account management actions
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { action, userId, nicNumber } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'unlock':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for unlock action' },
            { status: 400 }
          );
        }
        result = PasswordService.unlockUserAccount(userId);
        break;

      case 'reset_password':
        if (!userId || !nicNumber) {
          return NextResponse.json(
            { error: 'User ID and NIC number are required for password reset' },
            { status: 400 }
          );
        }
        result = await PasswordService.resetUserPasswordToNIC(userId, nicNumber);
        break;

      case 'unlock_all':
        result = PasswordService.unlockAllAccounts();
        break;

      case 'get_status':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for status check' },
            { status: 400 }
          );
        }
        const status = PasswordService.getAccountStatus(userId);
        return NextResponse.json({
          success: true,
          status
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error performing account management action:', error);
    return NextResponse.json(
      { error: 'Failed to perform account management action' },
      { status: 500 }
    );
  }
}
